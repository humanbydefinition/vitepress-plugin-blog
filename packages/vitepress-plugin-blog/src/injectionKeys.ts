/**
 * Vue injection keys for the VitePress Blog Plugin.
 *
 * These keys are used with Vue's provide/inject system to share
 * blog data across the component tree without prop drilling.
 *
 * @module injectionKeys
 */

import type { InjectionKey, Ref, Component, ShallowRef } from 'vue'
import type { BlogPostEntry } from './types'

/**
 * Type for VitePress's useData return value (subset we use).
 */
export interface VitePressPageData {
  frontmatter: Ref<Record<string, unknown>>
  page: Ref<{ relativePath: string; filePath?: string }>
}

/**
 * Type for VitePress's withBase function.
 */
export type WithBaseFunction = (path: string) => string

/**
 * Injection key for the base theme layout component.
 *
 * This key is used internally by the plugin to provide the base layout
 * to BlogPostLayout without requiring a direct import of DefaultTheme.
 *
 * @internal
 */
export const baseLayoutKey: InjectionKey<Component> = Symbol('baseLayout')

/**
 * Injection key for VitePress page data.
 * 
 * This provides access to useData() result without components needing to import
 * directly from 'vitepress', which causes SSR issues.
 * The value is a ShallowRef that gets populated after VitePress is loaded.
 * 
 * @internal
 */
export const vitePressDataKey: InjectionKey<ShallowRef<VitePressPageData | null>> = Symbol('vitePressData')

/**
 * Injection key for VitePress's withBase utility.
 * The value is a ShallowRef that gets populated after VitePress is loaded.
 * 
 * @internal
 */
export const withBaseKey: InjectionKey<ShallowRef<WithBaseFunction | null>> = Symbol('withBase')

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
