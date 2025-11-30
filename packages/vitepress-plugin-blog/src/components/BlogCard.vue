<template>
  <article class="blog-card">
    <a :href="withBase(post.url)" class="blog-card__link">
      <div v-if="post.cover" class="blog-card__cover">
        <img :src="post.cover" :alt="post.title" loading="lazy" />
      </div>

      <div class="blog-card__content">
        <header class="blog-card__header">
          <time v-if="post.date" class="blog-card__meta" :datetime="post.date">
            {{ formatDate(post.date) }}
          </time>
          <span v-if="post.readingTime" class="blog-card__meta">
            · {{ post.readingTime }} min read
          </span>
        </header>

        <h2 class="blog-card__title">{{ post.title }}</h2>

        <p v-if="post.description" class="blog-card__excerpt">
          {{ post.description }}
        </p>

        <footer class="blog-card__footer">
          <div class="blog-card__author">
            <img
              v-if="isGitHubUsername(post.author)"
              :src="getGitHubAvatarUrl(post.author)"
              :alt="`${post.author}'s avatar`"
              class="blog-card__avatar"
              loading="lazy"
            />
            <span>{{ post.author }}</span>
          </div>

          <ul v-if="post.tags?.length" class="blog-card__tags">
            <li v-for="tag in post.tags" :key="tag">#{{ tag }}</li>
          </ul>
        </footer>
      </div>
    </a>
  </article>
</template>

<script setup lang="ts">
/**
 * BlogCard Component
 *
 * Displays a single blog post as a clickable card with cover image,
 * metadata, excerpt, author info, and tags.
 *
 * @component
 * @example
 * ```vue
 * <BlogCard :post="post" />
 * ```
 */
import { withBase } from 'vitepress'
import { formatDate } from '../utils/date'
import { isGitHubUsername, getGitHubAvatarUrl } from '../utils/author'
import type { BlogPostEntry } from '../types'

// ============================================================================
// Props
// ============================================================================

interface Props {
  /** The blog post data to display */
  post: BlogPostEntry
}

defineProps<Props>()
</script>
