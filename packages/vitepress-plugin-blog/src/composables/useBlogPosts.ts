/**
 * Composable for accessing blog posts data.
 * 
 * Provides reactive access to blog posts from the plugin's
 * provide/inject system.
 * 
 * @module composables/useBlogPosts
 */

import { inject, ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { blogPostsKey } from '../injectionKeys'
import type { BlogPostEntry } from '../types'

/**
 * Return type for the useBlogPosts composable.
 */
export interface UseBlogPostsReturn {
  /** All blog posts, sorted by date (newest first) */
  posts: Ref<BlogPostEntry[]>
  /** Total number of posts */
  totalPosts: ComputedRef<number>
  /** All unique tags across all posts */
  allTags: ComputedRef<string[]>
}

/**
 * Composable for accessing blog posts data.
 * 
 * This composable retrieves blog posts from the plugin's provide/inject
 * system and provides convenient computed properties.
 * 
 * @returns An object with reactive blog posts data
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useBlogPosts } from 'vitepress-plugin-blog'
 * 
 * const { posts, totalPosts, allTags } = useBlogPosts()
 * </script>
 * ```
 */
export function useBlogPosts(): UseBlogPostsReturn {
  const posts = inject<Ref<BlogPostEntry[]>>(blogPostsKey, ref([]))

  const totalPosts = computed(() => posts.value.length)

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    for (const post of posts.value) {
      for (const tag of post.tags ?? []) {
        const trimmed = tag.trim()
        if (trimmed) tagSet.add(trimmed)
      }
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
  })

  return {
    posts,
    totalPosts,
    allTags,
  }
}
