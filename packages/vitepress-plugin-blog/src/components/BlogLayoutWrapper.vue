<template>
  <BlogPostLayout v-if="isBlogPost" :posts="posts" />
  <component :is="baseLayout" v-else>
    <slot />
    <template v-for="(_, slotName) in ($slots as Record<string, unknown>)" :key="slotName" #[slotName]>
      <slot :name="slotName" />
    </template>
  </component>
</template>

<script setup lang="ts">
/**
 * BlogLayoutWrapper Component
 * 
 * Internal wrapper component that switches between blog post layout
 * and the base theme layout based on frontmatter.
 * 
 * This component uses injected VitePress utilities to avoid direct imports
 * from 'vitepress' which cause SSR issues.
 * 
 * @internal
 */
import { computed, inject, type Component } from 'vue'
import BlogPostLayout from '../layouts/BlogPostLayout.vue'
import { blogPostsKey, baseLayoutKey, vitePressDataKey } from '../injectionKeys'
import type { BlogPostEntry } from '../types'

// ============================================================================
// Props
// ============================================================================

const props = defineProps<{
  /** Frontmatter key that marks a page as a blog post */
  blogFlagKey: string
}>()

// ============================================================================
// Setup
// ============================================================================

// Get VitePress data from injection (provided by withBlogTheme)
// This avoids importing useData from vitepress directly
const vitePressDataRef = inject(vitePressDataKey)

// Computed frontmatter from injected VitePress data
// vitePressDataRef is ShallowRef<VitePressPageData | null>
// VitePressPageData.frontmatter is Ref<Record<string, unknown>>
const frontmatter = computed(() => {
  const data = vitePressDataRef?.value
  if (!data) return {}
  return data.frontmatter?.value ?? {}
})

// Inject blog posts from parent
const postsRef = inject(blogPostsKey)
const posts = computed<BlogPostEntry[]>(() => postsRef?.value ?? [])

// Inject base layout from parent
const baseLayout = inject(baseLayoutKey) as Component

// ============================================================================
// Computed
// ============================================================================

/**
 * Whether the current page is a blog post based on frontmatter.
 */
const isBlogPost = computed(() => {
  return frontmatter.value?.[props.blogFlagKey] === true
})
</script>
