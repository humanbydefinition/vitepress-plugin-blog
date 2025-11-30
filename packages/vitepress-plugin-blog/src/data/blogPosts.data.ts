/**
 * VitePress Data Loader for Blog Posts
 *
 * This module provides a pre-configured data loader that automatically
 * discovers and processes blog posts from the `blog/posts` directory.
 *
 * @module data/blogPosts.data
 *
 * @example
 * Usage in your theme:
 * ```ts
 * // .vitepress/theme/posts.data.ts
 * import blogPostsLoader from 'vitepress-plugin-blog/data'
 * export default blogPostsLoader
 * export { data } from 'vitepress-plugin-blog/data'
 * ```
 */

import type { BlogPostEntry } from '../types'

// Re-export types for convenience
export type { BlogPostEntry }

// Type declarations for the data export
declare const data: BlogPostEntry[]
export { data }

// ============================================================================
// Configuration
// ============================================================================

/** Glob pattern for discovering blog post files */
const BLOG_POSTS_GLOB = 'blog/posts/**/*.md'

/** Average words per minute for reading time calculation */
const WORDS_PER_MINUTE = 220

/** Default author name when not specified in frontmatter */
const DEFAULT_AUTHOR = 'Anonymous'

// ============================================================================
// Loader Implementation
// ============================================================================

type LoaderModule = Awaited<ReturnType<typeof importLoader>>

/**
 * Normalizes file path separators for cross-platform compatibility.
 */
function normalizeWatchPattern(pattern: string): string {
  return pattern.replace(/\\+/g, '/')
}

// Access VitePress config for source directory
const config = (globalThis as any).VITEPRESS_CONFIG
const resolvedWatch = config?.srcDir
  ? [normalizeWatchPattern(`${config.srcDir}/${BLOG_POSTS_GLOB}`)]
  : [BLOG_POSTS_GLOB]

// Singleton loader promise for caching
let loaderPromise: Promise<LoaderModule> | null = null

/**
 * Creates and configures the content loader.
 */
async function importLoader() {
  const { createContentLoader } = await import('vitepress')

  return createContentLoader(BLOG_POSTS_GLOB, {
    excerpt: true,
    includeSrc: true,
    transform(posts): BlogPostEntry[] {
      return posts
        .map((post) => transformPost(post))
        .filter((post) => post.published)
        .sort(sortByDateDescending)
    },
  })
}

/**
 * Transforms a raw post from the content loader into a BlogPostEntry.
 */
function transformPost(post: any): BlogPostEntry {
  const frontmatter = post.frontmatter as Record<string, any>
  const sourceContent = post.src ?? ''

  // Calculate reading time from word count
  const wordCount = typeof sourceContent === 'string'
    ? sourceContent.trim().split(/\s+/).filter(Boolean).length
    : 0
  const readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))

  // Extract and clean description
  const rawDescription = frontmatter?.description ?? post.excerpt ?? ''
  const description = typeof rawDescription === 'string'
    ? rawDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : ''

  // Derive slug from frontmatter or URL
  const permalink = post.url
  const slug = frontmatter?.slug
    ?? permalink.replace(/\/$/, '').split('/').pop()
    ?? ''

  return {
    title: frontmatter?.title ?? 'Untitled post',
    description,
    date: frontmatter?.date ?? '',
    tags: Array.isArray(frontmatter?.tags) ? frontmatter.tags : [],
    author: frontmatter?.author ?? DEFAULT_AUTHOR,
    url: permalink,
    slug,
    readingTime,
    cover: frontmatter?.cover ?? null,
    source: sourceContent,
    published: frontmatter?.published ?? true,
  }
}

/**
 * Sort comparator for posts by date (newest first).
 */
function sortByDateDescending(a: BlogPostEntry, b: BlogPostEntry): number {
  const aTime = a.date ? Date.parse(a.date) : 0
  const bTime = b.date ? Date.parse(b.date) : 0
  return bTime - aTime
}

/**
 * Gets or creates the cached loader instance.
 */
async function getLoader() {
  if (!loaderPromise) {
    loaderPromise = importLoader()
  }
  return loaderPromise
}

// ============================================================================
// Loader Export
// ============================================================================

/**
 * VitePress Data Loader for blog posts.
 *
 * Features:
 * - Automatic discovery of markdown files in blog/posts
 * - HMR support for content changes
 * - Frontmatter extraction and validation
 * - Reading time calculation
 * - Date-based sorting (newest first)
 * - Unpublished post filtering
 */
export default {
  watch: resolvedWatch,
  async load(): Promise<BlogPostEntry[]> {
    const loader = await getLoader()
    return await loader.load()
  },
}
