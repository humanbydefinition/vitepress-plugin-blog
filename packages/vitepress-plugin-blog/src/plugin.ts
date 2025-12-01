/**
 * Vite plugin for automatic blog post discovery.
 *
 * This plugin scans the blog/posts directory and provides the posts
 * data by injecting it into the HTML, eliminating the need for manual data loader setup.
 *
 * @module plugin
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Plugin } from 'vite'
import type { BlogPostEntry } from './types'

/**
 * Configuration options for the blog Vite plugin.
 */
export interface BlogPluginOptions {
  /**
   * Directory containing blog posts, relative to the docs directory.
   * @default 'blog/posts'
   */
  postsDir?: string

  /**
   * Average words per minute for reading time calculation.
   * @default 220
   */
  wordsPerMinute?: number
}

/**
 * Scans the file system for blog posts and extracts their metadata.
 */
function scanBlogPosts(
  docsDir: string,
  postsDir: string,
  wordsPerMinute: number
): BlogPostEntry[] {
  const fullPostsDir = path.resolve(docsDir, postsDir)

  if (!fs.existsSync(fullPostsDir)) {
    return []
  }

  const posts: BlogPostEntry[] = []

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        walkDir(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8')
          const { data: frontmatter, content: rawContent } = matter(content)

          // Skip unpublished posts
          if (frontmatter.published === false) continue

          // Skip non-blog posts (must have blogPost: true or be in blog/posts)
          // We don't require blogPost: true here since files are in blog/posts/

          // Calculate URL from file path
          const relativePath = path.relative(docsDir, fullPath)
          const url = '/' + relativePath
            .replace(/\\/g, '/')
            .replace(/\.md$/, '')
            .replace(/\/index$/, '/')

          // Calculate reading time
          const words = rawContent.trim().split(/\s+/).filter(Boolean).length
          const readingTime = Math.max(1, Math.round(words / wordsPerMinute))

          // Extract description
          const rawDescription = frontmatter.description ?? ''
          const description = typeof rawDescription === 'string'
            ? rawDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            : ''

          // Derive slug
          const slug = frontmatter.slug
            ?? url.replace(/\/$/, '').split('/').pop()?.replace(/\.html$/, '')
            ?? ''

          posts.push({
            title: frontmatter.title ?? 'Untitled post',
            description,
            date: frontmatter.date ?? '',
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
            author: frontmatter.author ?? 'Anonymous',
            url,
            slug,
            readingTime,
            cover: frontmatter.cover ?? null,
            source: relativePath,
            published: true,
          })
        } catch (e) {
          console.warn(`[vitepress-plugin-blog] Could not parse ${fullPath}:`, e)
        }
      }
    }
  }

  walkDir(fullPostsDir)

  // Sort by date (newest first)
  posts.sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) : 0
    const bTime = b.date ? Date.parse(b.date) : 0
    return bTime - aTime
  })

  return posts
}

/**
 * Vite plugin that provides automatic blog post discovery.
 *
 * This plugin:
 * - Scans the blog/posts directory for markdown files
 * - Extracts frontmatter and calculates reading time
 * - Injects posts data into the page via a script tag
 * - Supports HMR for blog post changes
 *
 * @param options - Plugin configuration options
 * @returns A Vite plugin
 *
 * @example
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress'
 * import { blogPlugin } from 'vitepress-plugin-blog'
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [blogPlugin()]
 *   }
 * })
 * ```
 */
export function blogPlugin(options: BlogPluginOptions = {}): Plugin {
  const {
    postsDir = 'blog/posts',
    wordsPerMinute = 220,
  } = options

  let docsDir: string
  let posts: BlogPostEntry[] = []

  // Virtual module ID for blog posts data
  const VIRTUAL_MODULE_ID = 'virtual:blog-posts'
  const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

  return {
    name: 'vitepress-plugin-blog',
    enforce: 'pre',

    configResolved(config) {
      // Determine docs directory from VitePress root
      docsDir = config.root
      // Scan posts on config resolved
      posts = scanBlogPosts(docsDir, postsDir, wordsPerMinute)
    },

    // Resolve virtual module for blog posts
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },

    // Load virtual module with current posts data
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // Re-scan to get latest posts
        posts = scanBlogPosts(docsDir, postsDir, wordsPerMinute)
        return `export const blogPosts = ${JSON.stringify(posts)};`
      }
    },

    // Inject posts data into the HTML
    transformIndexHtml() {
      // Re-scan to get latest posts
      posts = scanBlogPosts(docsDir, postsDir, wordsPerMinute)
      
      return [
        {
          tag: 'script',
          attrs: { type: 'application/json', id: 'vitepress-blog-posts' },
          children: JSON.stringify(posts),
          injectTo: 'head',
        },
      ]
    },

    // Handle HMR for blog posts
    handleHotUpdate({ file, server }) {
      // Normalize paths for cross-platform comparison
      const normalizedFile = file.replace(/\\/g, '/')
      const normalizedPostsDir = postsDir.replace(/\\/g, '/')
      
      if (normalizedFile.includes(normalizedPostsDir) && file.endsWith('.md')) {
        console.log('[vitepress-plugin-blog] Blog post changed:', file)
        
        // Re-scan posts
        posts = scanBlogPosts(docsDir, postsDir, wordsPerMinute)
        console.log('[vitepress-plugin-blog] Scanned', posts.length, 'posts')
        
        // Send custom event with updated posts data
        server.ws.send({
          type: 'custom',
          event: 'blog-posts-update',
          data: posts,
        })
        
        console.log('[vitepress-plugin-blog] Sent HMR update event')
        
        // Invalidate the virtual module so it reloads with new data
        const virtualModule = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (virtualModule) {
          server.moduleGraph.invalidateModule(virtualModule)
        }
        
        // Don't return modules - let VitePress handle .md file HMR normally
        // Our custom event handles the blog posts list update
      }
    },
  }
}
