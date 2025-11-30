<template>
  <Layout>
    <!-- Post Header (before content) -->
    <template #doc-before>
      <article class="blog-post">
        <header class="blog-post__meta">
          <!-- Breadcrumb Navigation -->
          <p class="blog-post__breadcrumbs">
            <a :href="withBase('/blog/')">Blog</a>
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
          <ul v-if="frontmatter.tags?.length" class="blog-post__tags">
            <li v-for="tag in frontmatter.tags" :key="tag">#{{ tag }}</li>
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
            :href="withBase(prevPost.url)"
            class="blog-post__pagination-link prev"
          >
            <span class="pagination-label">← Newer</span>
            <span class="pagination-title">{{ prevPost.title }}</span>
          </a>

          <span class="blog-post__pagination-spacer" aria-hidden="true" />

          <a
            v-if="nextPost"
            :href="withBase(nextPost.url)"
            class="blog-post__pagination-link next"
          >
            <span class="pagination-label">Older →</span>
            <span class="pagination-title">{{ nextPost.title }}</span>
          </a>
        </nav>
      </footer>
    </template>
  </Layout>
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
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, withBase } from 'vitepress'
import { useBlogNavigation } from '../composables/useBlogNavigation'
import { formatDate } from '../utils/date'
import { isGitHubUsername, getGitHubAvatarUrl } from '../utils/author'
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

const Layout = DefaultTheme.Layout
const { frontmatter } = useData()
const { currentPost, prevPost, nextPost } = useBlogNavigation()

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
