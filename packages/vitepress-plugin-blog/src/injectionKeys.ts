import type { InjectionKey, Ref } from 'vue'
import type { BlogPostEntry } from './types'

/**
 * Injection key for blog posts data.
 * Used to provide/inject blog posts across the component tree.
 */
export const blogPostsKey: InjectionKey<Ref<BlogPostEntry[]>> = Symbol('blogPosts')
