/**
 * Vue injection keys for the VitePress Blog Plugin.
 *
 * These keys are used with Vue's provide/inject system to share
 * blog data across the component tree without prop drilling.
 *
 * @module injectionKeys
 */

import type { InjectionKey, Ref } from 'vue'
import type { BlogPostEntry } from './types'

/**
 * Injection key for blog posts data.
 *
 * This key is used internally by the plugin to provide blog posts
 * to all components. For most use cases, prefer using the
 * `useBlogPosts` composable instead of directly using this key.
 *
 * @example
 * Advanced usage (prefer useBlogPosts composable):
 * ```ts
 * import { inject } from 'vue'
 * import { blogPostsKey } from 'vitepress-plugin-blog'
 *
 * const posts = inject(blogPostsKey)
 * ```
 */
export const blogPostsKey: InjectionKey<Ref<BlogPostEntry[]>> = Symbol('blogPosts')
