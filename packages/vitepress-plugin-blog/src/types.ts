/**
 * Core types for the VitePress Blog Plugin.
 *
 * @module types
 */

/**
 * Controls when pagination is displayed in the BlogIndex component.
 * - 'always': Always show pagination controls
 * - 'auto': Show only when there are more posts than fit on one page
 * - 'never': Never show pagination controls
 */
export type PaginationVisibility = 'always' | 'auto' | 'never'

/**
 * Represents a blog post entry with all metadata.
 *
 * This interface defines the structure of blog post data as processed
 * by the data loader and used throughout the plugin components.
 *
 * @example
 * ```ts
 * const post: BlogPostEntry = {
 *   title: 'Getting Started with VitePress',
 *   description: 'Learn how to set up your first VitePress site',
 *   date: '2024-01-15',
 *   tags: ['vitepress', 'tutorial'],
 *   author: 'octocat',
 *   url: '/blog/posts/getting-started',
 *   slug: 'getting-started',
 *   readingTime: 5,
 *   cover: '/images/cover.jpg',
 *   source: 'blog/posts/getting-started.md',
 *   published: true,
 * }
 * ```
 */
export interface BlogPostEntry {
  /**
   * The title of the blog post.
   * Extracted from frontmatter `title` field.
   */
  title: string

  /**
   * A short description or excerpt of the post.
   * Used in post cards and meta descriptions.
   * Extracted from frontmatter `description` or auto-generated from content.
   */
  description: string

  /**
   * The publication date in ISO format (YYYY-MM-DD).
   * Used for sorting posts and displaying formatted dates.
   *
   * @example '2024-01-15'
   */
  date: string

  /**
   * Tags/categories for the post.
   * Used for filtering and organization.
   *
   * @example ['vitepress', 'tutorial', 'vue']
   */
  tags: string[]

  /**
   * The author's name or GitHub username.
   * If a valid GitHub username, the author's avatar will be displayed.
   *
   * @example 'octocat' or 'John Doe'
   */
  author: string

  /**
   * The URL path to the post (without base path).
   * Used for navigation links.
   *
   * @example '/blog/posts/getting-started'
   */
  url: string

  /**
   * The URL slug for the post.
   * Used for identifying the current post in navigation.
   *
   * @example 'getting-started'
   */
  slug: string

  /**
   * Estimated reading time in minutes.
   * Calculated based on word count (~220 words per minute).
   */
  readingTime: number

  /**
   * Cover image URL, if any.
   * Displayed at the top of post cards and pages.
   */
  cover: string | null

  /**
   * Source file path relative to the docs directory.
   *
   * @example 'blog/posts/getting-started.md'
   */
  source: string

  /**
   * Whether the post is published.
   * Unpublished posts (published: false) are excluded from listings.
   *
   * @default true
   */
  published: boolean
}
