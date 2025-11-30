/**
 * Sidebar generation utilities for VitePress config.
 * 
 * This module is designed to be imported in config files without
 * triggering Vue/VitePress client-side imports.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { BlogPostEntry } from './types'

/**
 * Represents a VitePress sidebar item.
 */
export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

/**
 * Configuration options for generating the blog sidebar.
 */
export interface BlogSidebarOptions {
  /**
   * The base path for the blog section.
   * @default '/blog/'
   */
  basePath?: string
  /**
   * Number of recent posts to show in the sidebar.
   * @default 5
   */
  recentPostsCount?: number
  /**
   * Label for the "All Posts" link.
   * @default 'All posts'
   */
  allPostsLabel?: string
  /**
   * Label for the "Recent Posts" section.
   * @default 'Recent posts'
   */
  recentPostsLabel?: string
  /**
   * Whether the recent posts section should be collapsed by default.
   * @default false
   */
  recentPostsCollapsed?: boolean
}

/**
 * Generates a VitePress sidebar configuration for the blog section.
 * 
 * This function creates a sidebar with:
 * - An "All Posts" link to the blog index
 * - A "Recent Posts" section with the most recent blog posts
 * 
 * @param posts - Array of blog posts from your data loader
 * @param options - Configuration options for the sidebar
 * @returns An array of sidebar items for use in VitePress config
 * 
 * @example
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress'
 * import { generateBlogSidebar } from 'vitepress-plugin-blog/sidebar'
 * import { data as posts } from './theme/posts.data.mts'
 * 
 * export default defineConfig({
 *   themeConfig: {
 *     sidebar: {
 *       '/blog/': generateBlogSidebar(posts),
 *     }
 *   }
 * })
 * ```
 */
export function generateBlogSidebar(
  posts: BlogPostEntry[],
  options: BlogSidebarOptions = {}
): SidebarItem[] {
  const {
    basePath = '/blog/',
    recentPostsCount = 5,
    allPostsLabel = 'All posts',
    recentPostsLabel = 'Recent posts',
    recentPostsCollapsed = false,
  } = options

  // Get the most recent posts (already sorted by date in data loader)
  const recentPosts = posts.slice(0, recentPostsCount)

  const sidebar: SidebarItem[] = [
    {
      text: 'Blog',
      items: [
        { text: allPostsLabel, link: basePath },
      ],
    },
  ]

  // Add recent posts section if there are posts
  if (recentPosts.length > 0) {
    sidebar.push({
      text: recentPostsLabel,
      collapsed: recentPostsCollapsed,
      items: recentPosts.map((post) => ({
        text: post.title,
        link: post.url,
      })),
    })
  }

  return sidebar
}

/**
 * Synchronously generates a blog sidebar by scanning markdown files.
 * 
 * Use this in your VitePress config file where async data loaders aren't available.
 * This function reads the blog posts directory and extracts frontmatter to build the sidebar.
 * 
 * @param docsDir - Absolute path to your docs directory
 * @param options - Configuration options for the sidebar
 * @returns An array of sidebar items for use in VitePress config
 * 
 * @example
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress'
 * import { generateBlogSidebarFromFiles } from 'vitepress-plugin-blog/sidebar'
 * import { fileURLToPath } from 'url'
 * import { dirname, resolve } from 'path'
 * 
 * const __dirname = dirname(fileURLToPath(import.meta.url))
 * 
 * export default defineConfig({
 *   themeConfig: {
 *     sidebar: {
 *       '/blog/': generateBlogSidebarFromFiles(resolve(__dirname, '..')),
 *     }
 *   }
 * })
 * ```
 */
export function generateBlogSidebarFromFiles(
  docsDir: string,
  options: BlogSidebarOptions & {
    /**
     * Glob pattern for blog post files relative to docsDir.
     * @default 'blog/posts/*.md'
     */
    postsPattern?: string
  } = {}
): SidebarItem[] {
  const {
    basePath = '/blog/',
    recentPostsCount = 5,
    allPostsLabel = 'All posts',
    recentPostsLabel = 'Recent posts',
    recentPostsCollapsed = false,
    postsPattern = 'blog/posts/**/*.md',
  } = options

  // Simple glob implementation for matching files
  function glob(pattern: string, cwd: string): string[] {
    const results: string[] = []
    const parts = pattern.split('/')
    
    function walk(dir: string, patternIndex: number) {
      if (patternIndex >= parts.length) return
      
      const part = parts[patternIndex]
      const isLast = patternIndex === parts.length - 1
      
      if (!fs.existsSync(dir)) return
      
      if (part === '**') {
        // Match any depth
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            walk(fullPath, patternIndex) // Stay at ** level
            walk(fullPath, patternIndex + 1) // Move past **
          } else if (isLast || patternIndex === parts.length - 2) {
            // Check if file matches next pattern
            const nextPart = parts[patternIndex + 1] || part
            const regex = new RegExp('^' + nextPart.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
            if (regex.test(entry.name)) {
              results.push(fullPath)
            }
          }
        }
      } else if (part.includes('*')) {
        // Wildcard match
        const regex = new RegExp('^' + part.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (regex.test(entry.name)) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory() && !isLast) {
              walk(fullPath, patternIndex + 1)
            } else if (entry.isFile() && isLast) {
              results.push(fullPath)
            }
          }
        }
      } else {
        // Exact match
        const fullPath = path.join(dir, part)
        if (fs.existsSync(fullPath)) {
          if (isLast) {
            results.push(fullPath)
          } else {
            walk(fullPath, patternIndex + 1)
          }
        }
      }
    }
    
    walk(cwd, 0)
    return results
  }

  // Find all blog post files
  const files = glob(postsPattern, docsDir)

  // Parse frontmatter and build post list
  const posts: Array<{ title: string; date: string; url: string; published: boolean }> = []

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      const { data: frontmatter } = matter(content)
      
      // Skip unpublished posts
      if (frontmatter.published === false) continue
      
      // Build URL from file path
      const relativePath = path.relative(docsDir, file)
      const url = '/' + relativePath
        .replace(/\\/g, '/')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '/')
      
      posts.push({
        title: frontmatter.title || 'Untitled',
        date: frontmatter.date || '',
        url,
        published: frontmatter.published !== false,
      })
    } catch (e) {
      // Skip files that can't be parsed
      console.warn(`[vitepress-plugin-blog] Could not parse ${file}:`, e)
    }
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) : 0
    const bTime = b.date ? Date.parse(b.date) : 0
    return bTime - aTime
  })

  // Get recent posts
  const recentPosts = posts.slice(0, recentPostsCount)

  const sidebar: SidebarItem[] = [
    {
      text: 'Blog',
      items: [
        { text: allPostsLabel, link: basePath },
      ],
    },
  ]

  if (recentPosts.length > 0) {
    sidebar.push({
      text: recentPostsLabel,
      collapsed: recentPostsCollapsed,
      items: recentPosts.map((post) => ({
        text: post.title,
        link: post.url,
      })),
    })
  }

  return sidebar
}
