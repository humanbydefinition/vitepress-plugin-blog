/**
 * vitepress-plugin-blog
 *
 * A VitePress plugin for adding blog functionality with automatic post discovery,
 * layouts, and components.
 *
 * @packageDocumentation
 */

import DefaultTheme from 'vitepress/theme'
import type { Theme, EnhanceAppContext } from 'vitepress'
import { defineComponent, h, provide, shallowRef } from 'vue'
import { useData } from 'vitepress'

// Internal imports
import BlogPostLayout from './layouts/BlogPostLayout.vue'
import BlogIndex from './components/BlogIndex.vue'
import BlogCard from './components/BlogCard.vue'
import BlogFilters from './components/BlogFilters.vue'
import BlogPagination from './components/BlogPagination.vue'
import { blogPostsKey } from './injectionKeys'
import type { BlogPostEntry } from './types'

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the blog plugin.
 */
export interface BlogOptions {
  /**
   * Frontmatter key that marks a page as a blog post.
   * When a page's frontmatter contains this key set to `true`,
   * it will be rendered using the BlogPostLayout.
   *
   * @default 'blogPost'
   *
   * @example
   * ```yaml
   * ---
   * blogPost: true
   * title: My First Post
   * ---
   * ```
   */
  blogFrontmatterKey?: string

  /**
   * Blog posts data from a VitePress data loader.
   * Import your data loader and pass the `data` export here.
   *
   * @example
   * ```ts
   * import { data as posts } from './posts.data'
   * withBlogTheme(DefaultTheme, { posts })
   * ```
   */
  posts?: BlogPostEntry[]
}

// ============================================================================
// Public Exports
// ============================================================================

// Types
export type { BlogPostEntry, PaginationVisibility } from './types'

// Components (BlogIndex is the main component, others available for customization)
export { BlogIndex, BlogCard, BlogFilters, BlogPagination, BlogPostLayout }

// Legacy aliases for backward compatibility
/** @deprecated Use BlogIndex instead */
export { BlogIndex as BlogPostList }
/** @deprecated Use BlogIndex instead */
export { BlogIndex as BlogHome }

// Composables
export { useBlogPosts, useBlogNavigation } from './composables'
export type { UseBlogPostsReturn, UseBlogNavigationReturn } from './composables'

// Utilities
export { formatDate, parseDate } from './utils/date'
export { isGitHubUsername, getGitHubAvatarUrl } from './utils/author'

// Injection Keys (for advanced usage)
export { blogPostsKey } from './injectionKeys'

// Sidebar utilities (prefer importing from 'vitepress-plugin-blog/sidebar')
export { generateBlogSidebar, generateBlogSidebarFromFiles } from './sidebar'
export type { SidebarItem, BlogSidebarOptions } from './sidebar'

// ============================================================================
// Main Plugin Function
// ============================================================================

/**
 * Wraps an existing VitePress theme with blog functionality.
 *
 * This function returns a new theme that:
 * - Automatically uses BlogPostLayout for pages with the blog frontmatter flag
 * - Registers BlogPostList and BlogHome as global components
 * - Provides blog posts data to all components via Vue's provide/inject
 *
 * @param baseTheme - The base VitePress theme to extend (defaults to DefaultTheme)
 * @param options - Configuration options for the blog plugin
 * @returns A new VitePress theme with blog functionality
 *
 * @example
 * Basic usage with default theme:
 * ```ts
 * // .vitepress/theme/index.ts
 * import DefaultTheme from 'vitepress/theme'
 * import { withBlogTheme } from 'vitepress-plugin-blog'
 * import { data as posts } from './posts.data'
 * import 'vitepress-plugin-blog/style.css'
 *
 * export default withBlogTheme(DefaultTheme, { posts })
 * ```
 *
 * @example
 * With custom frontmatter key:
 * ```ts
 * export default withBlogTheme(DefaultTheme, {
 *   posts,
 *   blogFrontmatterKey: 'isBlogPost'
 * })
 * ```
 */
export function withBlogTheme(
  baseTheme: Theme = DefaultTheme,
  options: BlogOptions = {}
): Theme {
  const blogFlagKey = options.blogFrontmatterKey ?? 'blogPost'
  const BaseLayout = baseTheme.Layout ?? DefaultTheme.Layout
  const postsData = options.posts ?? []

  /**
   * Layout component that switches between blog and default layouts
   * based on frontmatter.
   */
  const BlogAwareLayout = defineComponent({
    name: 'BlogAwareLayout',
    setup(_, { slots }) {
      const { frontmatter } = useData()

      // Provide blog posts to all child components
      const postsRef = shallowRef<BlogPostEntry[]>(postsData)
      provide(blogPostsKey, postsRef)

      return () => {
        // Use BlogPostLayout for pages marked as blog posts
        if (frontmatter.value?.[blogFlagKey] === true) {
          return h(BlogPostLayout, { posts: postsData })
        }

        // Use the base layout for all other pages
        return h(BaseLayout, null, slots)
      }
    },
  })

  return {
    extends: baseTheme,
    Layout: BlogAwareLayout,
    enhanceApp(ctx: EnhanceAppContext) {
      const { app } = ctx

      // Register global components
      // BlogIndex is the main component, registered under multiple names for convenience
      app.component('BlogIndex', BlogIndex)
      app.component('BlogPostList', BlogIndex)  // Legacy alias
      app.component('BlogHome', BlogIndex)      // Legacy alias
    },
  }
}
