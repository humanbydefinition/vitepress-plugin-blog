/**
 * Composable for blog post navigation (prev/next posts).
 * 
 * @module composables/useBlogNavigation
 */

import { computed, inject } from 'vue'
import type { ComputedRef } from 'vue'
import { useBlogPosts } from './useBlogPosts'
import { vitePressDataKey } from '../injectionKeys'
import type { BlogPostEntry } from '../types'

/**
 * Return type for the useBlogNavigation composable.
 */
export interface UseBlogNavigationReturn {
  /** The current post based on the page slug */
  currentPost: ComputedRef<BlogPostEntry | null>
  /** The previous (newer) post, or null if at the beginning */
  prevPost: ComputedRef<BlogPostEntry | null>
  /** The next (older) post, or null if at the end */
  nextPost: ComputedRef<BlogPostEntry | null>
  /** The index of the current post in the posts array */
  currentIndex: ComputedRef<number>
}

/**
 * Extracts the slug from the current page using injected VitePress data.
 */
function useCurrentSlug(): ComputedRef<string> {
  const vitePressDataRef = inject(vitePressDataKey)

  return computed(() => {
    const data = vitePressDataRef?.value
    if (!data) return ''
    
    const fm = data.frontmatter?.value as Record<string, unknown> | undefined
    const pageData = data.page?.value

    // Try explicit slug first
    if (fm && typeof fm.slug === 'string' && fm.slug.trim()) {
      return fm.slug.trim()
    }

    // Try permalink
    if (fm && typeof fm.permalink === 'string' && fm.permalink.trim()) {
      return fm.permalink.replace(/\/$/, '').split('/').pop() ?? ''
    }

    // Fall back to file path
    const relativePath = pageData?.relativePath ?? ''
    return relativePath
      .replace(/index\.md$/i, '')
      .split('/')
      .pop()
      ?.replace(/\.md$/i, '') ?? ''
  })
}

/**
 * Composable for navigating between blog posts.
 * 
 * Provides access to the current, previous, and next posts
 * based on the current page's slug.
 * 
 * @returns An object with navigation data
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useBlogNavigation } from 'vitepress-plugin-blog'
 * 
 * const { currentPost, prevPost, nextPost } = useBlogNavigation()
 * </script>
 * 
 * <template>
 *   <a v-if="prevPost" :href="prevPost.url">← {{ prevPost.title }}</a>
 *   <a v-if="nextPost" :href="nextPost.url">{{ nextPost.title }} →</a>
 * </template>
 * ```
 */
export function useBlogNavigation(): UseBlogNavigationReturn {
  const { posts } = useBlogPosts()
  const currentSlug = useCurrentSlug()

  const currentIndex = computed(() => {
    const slug = currentSlug.value
    return posts.value.findIndex((post) => {
      // Compare slugs, handling both with and without .html extension
      const postSlug = post.slug.replace(/\.html$/, '')
      return postSlug === slug || post.slug === slug
    })
  })

  const currentPost = computed(() => 
    currentIndex.value >= 0 ? posts.value[currentIndex.value] : null
  )

  const prevPost = computed(() => 
    currentIndex.value > 0 ? posts.value[currentIndex.value - 1] : null
  )

  const nextPost = computed(() => {
    const idx = currentIndex.value
    const len = posts.value.length
    return idx >= 0 && idx < len - 1 ? posts.value[idx + 1] : null
  })

  return {
    currentPost,
    prevPost,
    nextPost,
    currentIndex,
  }
}
