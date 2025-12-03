<template>
  <component :is="Layout" v-if="Layout">
    <!-- Post Header (before content) -->
    <template #doc-before>
      <article class="blog-post">
        <header class="blog-post__meta">
          <!-- Breadcrumb Navigation -->
          <p class="blog-post__breadcrumbs">
            <a :href="getUrl('/blog/')">Blog</a>
            <span aria-hidden="true"> / </span>
            <span>{{ frontmatter.title }}</span>
          </p>

          <!-- Title -->
          <h1 class="blog-post__title">{{ frontmatter.title }}</h1>

          <!-- Description -->
          <p v-if="frontmatter.description" class="blog-post__description">
            {{ frontmatter.description }}
          </p>

          <!-- Post Details: Author, Date, Reading Time -->
          <div class="blog-post__details">
            <div v-if="frontmatter.author" class="blog-post__author">
              <img
                v-if="isGitHubUsername(frontmatter.author as string)"
                :src="getGitHubAvatarUrl(frontmatter.author as string)"
                :alt="`${frontmatter.author}'s avatar`"
                class="blog-post__avatar"
                loading="lazy"
              />
              <span>{{ frontmatter.author }}</span>
            </div>

            <time
              v-if="formattedDate"
              class="blog-post__detail"
              :datetime="frontmatter.date as string"
            >
              {{ formattedDate }}
            </time>

            <span v-if="currentPost?.readingTime" class="blog-post__detail">
              · {{ currentPost.readingTime }} min read
            </span>
          </div>

          <!-- Tags -->
          <ul v-if="(frontmatter.tags as string[] | undefined)?.length" class="blog-post__tags">
            <li v-for="tag in (frontmatter.tags as string[])" :key="tag">#{{ tag }}</li>
          </ul>

          <!-- Cover Image -->
          <figure v-if="frontmatter.cover" class="blog-post__cover">
            <img
              :src="frontmatter.cover as string"
              :alt="frontmatter.title as string"
              loading="lazy"
            />
          </figure>
        </header>
      </article>
    </template>

    <!-- Post Footer (after content) -->
    <template #doc-after>
      <footer class="blog-post__footer">
        <!-- Previous/Next Navigation -->
        <nav
          v-if="prevPost || nextPost"
          class="blog-post__pagination"
          aria-label="Blog post navigation"
        >
          <a
            v-if="prevPost"
            :href="getUrl(prevPost.url)"
            class="blog-post__pagination-link prev"
          >
            <span class="pagination-label">← Newer</span>
            <span class="pagination-title">{{ prevPost.title }}</span>
          </a>

          <span class="blog-post__pagination-spacer" aria-hidden="true" />

          <a
            v-if="nextPost"
            :href="getUrl(nextPost.url)"
            class="blog-post__pagination-link next"
          >
            <span class="pagination-label">Older →</span>
            <span class="pagination-title">{{ nextPost.title }}</span>
          </a>
        </nav>
      </footer>
    </template>
  </component>
</template>

<script setup lang="ts">
/**
 * BlogPostLayout Component
 *
 * Custom layout for individual blog posts. Extends the default VitePress
 * layout with blog-specific header and footer sections.
 *
 * Features:
 * - Post metadata display (author, date, reading time)
 * - Tag display
 * - Cover image support
 * - Previous/Next post navigation
 *
 * @component
 */
import { computed, inject } from 'vue'
import { formatDate } from '../utils/date'
import { isGitHubUsername, getGitHubAvatarUrl } from '../utils/author'
import { baseLayoutKey, vitePressDataKey, withBaseKey } from '../injectionKeys'
import { useBlogPosts } from '../composables/useBlogPosts'
import type { BlogPostEntry } from '../types'

// ============================================================================
// Props
// ============================================================================

defineProps<{
  /** Blog posts passed as props (fallback if inject fails) */
  posts?: BlogPostEntry[]
}>()

// ============================================================================
// Setup
// ============================================================================

// Get the base layout from injection (provided by withBlogTheme)
// This avoids importing DefaultTheme directly which causes SSR issues
const Layout = inject(baseLayoutKey)

if (!Layout) {
  console.error('[vitepress-plugin-blog] Base layout not found. Make sure to use withBlogTheme() to wrap your theme.')
}

// Get VitePress data from injection
const vitePressDataRef = inject(vitePressDataKey)
const withBaseRef = inject(withBaseKey)

// Get blog posts for navigation
const { posts: blogPosts } = useBlogPosts()

// Computed frontmatter from injected VitePress data
// vitePressDataRef is ShallowRef<VitePressPageData | null>
// VitePressPageData.frontmatter is Ref<Record<string, unknown>>
const frontmatter = computed(() => {
  const data = vitePressDataRef?.value
  if (!data) return {}
  return data.frontmatter?.value ?? {}
})

// Get current page info for finding the current post
const page = computed(() => {
  const data = vitePressDataRef?.value
  if (!data) return { relativePath: '' }
  return data.page?.value ?? { relativePath: '' }
})

// Find current post from blog posts based on URL
const currentPost = computed<BlogPostEntry | null>(() => {
  const relativePath = page.value.relativePath
  if (!relativePath) return null
  
  // Convert relative path to URL format
  const url = '/' + relativePath.replace(/\.md$/, '').replace(/index$/, '')
  
  return blogPosts.value.find(post => {
    const postUrl = post.url.replace(/\/$/, '')
    const pageUrl = url.replace(/\/$/, '')
    return postUrl === pageUrl || post.slug === pageUrl.split('/').pop()
  }) ?? null
})

// Find current index for prev/next navigation
const currentIndex = computed(() => {
  if (!currentPost.value) return -1
  return blogPosts.value.findIndex(p => p.url === currentPost.value?.url)
})

// Previous post (newer)
const prevPost = computed<BlogPostEntry | null>(() => {
  if (currentIndex.value <= 0) return null
  return blogPosts.value[currentIndex.value - 1]
})

// Next post (older)
const nextPost = computed<BlogPostEntry | null>(() => {
  if (currentIndex.value < 0 || currentIndex.value >= blogPosts.value.length - 1) return null
  return blogPosts.value[currentIndex.value + 1]
})

/**
 * Helper to apply withBase if available, otherwise return path as-is
 */
function getUrl(path: string): string {
  return withBaseRef?.value?.(path) ?? path
}

// ============================================================================
// Computed
// ============================================================================

/**
 * Formatted publication date.
 */
const formattedDate = computed(() => {
  const date = frontmatter.value.date
  if (!date || typeof date !== 'string') return ''
  return formatDate(date)
})
</script>
