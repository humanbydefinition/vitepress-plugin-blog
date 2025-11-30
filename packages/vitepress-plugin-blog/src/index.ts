/**
 * vitepress-plugin-blog
 *
 * A VitePress plugin for adding blog functionality with automatic post discovery,
 * layouts, and components.
 */

import DefaultTheme from 'vitepress/theme'
import type { Theme, EnhanceAppContext } from 'vitepress'
import { defineComponent, h, provide, shallowRef, onMounted } from 'vue'
import { useData } from 'vitepress'

import BlogPostLayout from './layouts/BlogPostLayout.vue'
import BlogPostList from './components/BlogPostList.vue'
import BlogHome from './components/BlogHome.vue'
import { blogPostsKey } from './injectionKeys'
import type { BlogPostEntry } from './types'

/**
 * Configuration options for the blog plugin.
 */
export interface BlogOptions {
  /**
   * Frontmatter flag that marks a page as a blog post.
   * When a page's frontmatter contains this key set to `true`,
   * it will be rendered using the BlogPostLayout.
   * @default 'blogPost'
   */
  blogFrontmatterKey?: string

  /**
   * Blog posts data from a VitePress data loader.
   * Import your data loader and pass the `data` export here.
   * @example
   * ```ts
   * import { data as posts } from './blog.data'
   * withBlogTheme(DefaultTheme, { posts })
   * ```
   */
  posts?: BlogPostEntry[]
}

// Re-export types and components for consumers
export type { BlogPostEntry } from './types'
export { BlogPostList, BlogPostLayout, BlogHome }
export { blogPostsKey } from './injectionKeys'

// Re-export sidebar utilities for convenience (though prefer importing from 'vitepress-plugin-blog/sidebar')
export { generateBlogSidebar, generateBlogSidebarFromFiles } from './sidebar'
export type { SidebarItem, BlogSidebarOptions } from './sidebar'

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
 * ```ts
 * // .vitepress/theme/index.ts
 * import DefaultTheme from 'vitepress/theme'
 * import { withBlogTheme } from 'vitepress-plugin-blog'
 * import { data as posts } from './posts.data'
 * import 'vitepress-plugin-blog/style.css'
 * 
 * export default withBlogTheme(DefaultTheme, { posts })
 * ```
 */
export function withBlogTheme(baseTheme: Theme = DefaultTheme, options: BlogOptions = {}): Theme {
  const blogFlagKey = options.blogFrontmatterKey ?? 'blogPost'
  const BaseLayout = baseTheme.Layout ?? DefaultTheme.Layout
  const postsData = options.posts ?? []

  const BlogAwareLayout = defineComponent({
    name: 'BlogAwareLayout',
    setup(_, { slots }) {
      const { frontmatter } = useData()
      
      // Provide blog posts to all child components
      const postsRef = shallowRef<BlogPostEntry[]>(postsData)
      provide(blogPostsKey, postsRef)

      return () => {
        if (frontmatter.value?.[blogFlagKey] === true) {
          // Pass posts as props as a fallback
          return h(BlogPostLayout, { posts: postsData })
        }

        return h(BaseLayout, null, slots)
      }
    },
  })

  return {
    extends: baseTheme,
    Layout: BlogAwareLayout,
    enhanceApp(ctx: EnhanceAppContext) {
      const { app } = ctx

      app.component('BlogPostList', BlogPostList)
      app.component('BlogHome', BlogHome)
    },
  }
}
