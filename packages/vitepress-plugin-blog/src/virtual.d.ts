/**
 * Type declarations for the virtual blog posts module.
 */

declare module 'virtual:blog-posts' {
  import type { BlogPostEntry } from 'vitepress-plugin-blog'
  export const blogPosts: BlogPostEntry[]
}
