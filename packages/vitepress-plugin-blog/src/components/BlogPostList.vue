<template>
  <div class="blog-index">
    <div class="blog-index__controls">
      <input
        v-model="searchQuery"
        type="search"
        class="blog-index__search"
        placeholder="Search posts by title or description"
        aria-label="Search blog posts"
      />

      <div v-if="availableTags.length" class="blog-index__filters">
        <button
          v-for="filterTag in ['all', ...availableTags]"
          :key="filterTag"
          type="button"
          class="blog-index__tag"
          :class="{ 'blog-index__tag--active': filterTag === activeTag }"
          @click="setActiveTag(filterTag)"
        >
          <span v-if="filterTag === 'all'">All posts</span>
          <span v-else>#{{ filterTag }}</span>
        </button>
      </div>
    </div>

    <div v-if="filteredPosts.length" class="blog-index__grid">
      <article v-for="post in filteredPosts" :key="post.url" class="blog-card">
        <a :href="post.url" class="blog-card__link">
          <div v-if="post.cover" class="blog-card__cover">
            <img :src="post.cover" :alt="post.title" loading="lazy" />
          </div>
          <div class="blog-card__content">
            <header class="blog-card__header">
              <time v-if="post.date" class="blog-card__meta" :datetime="post.date">
                {{ formatDate(post.date) }}
              </time>
              <span class="blog-card__meta" v-if="post.readingTime">
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
                  :src="`https://github.com/${post.author}.png`" 
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
    </div>

    <p v-else class="blog-index__empty">
      No posts matched your filters. Try clearing the search or choosing a different tag.
    </p>

    <!-- Pagination -->
    <div v-if="totalPages > 1 || pageSizeOptions.length > 1" class="blog-index__pagination">
      <div class="blog-index__pagination-info">
        Showing {{ paginationStart }}–{{ paginationEnd }} of {{ totalPosts }} posts
      </div>
      
      <div class="blog-index__pagination-controls">
        <button
          type="button"
          class="blog-index__pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
          aria-label="First page"
        >
          ««
        </button>
        <button
          type="button"
          class="blog-index__pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
          aria-label="Previous page"
        >
          «
        </button>
        
        <span class="blog-index__pagination-current">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          type="button"
          class="blog-index__pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          aria-label="Next page"
        >
          »
        </button>
        <button
          type="button"
          class="blog-index__pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
          aria-label="Last page"
        >
          »»
        </button>
      </div>

      <div v-if="pageSizeOptions.length > 1" class="blog-index__page-size">
        <label for="page-size-select">Posts per page:</label>
        <select
          id="page-size-select"
          v-model="pageSize"
          class="blog-index__page-size-select"
          @change="currentPage = 1"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, watch } from 'vue'
import type { Ref } from 'vue'
import { blogPostsKey } from '../injectionKeys'
import type { BlogPostEntry } from '../types'

type BlogPost = BlogPostEntry

// Props for pagination configuration
const props = withDefaults(defineProps<{
  /**
   * Available page size options for the user to choose from.
   * If only one value is provided, the selector is hidden.
   * @default [5, 10, 20]
   */
  pageSizes?: number[]
  /**
   * Initial page size to use.
   * If not provided, uses the first value from pageSizes.
   */
  defaultPageSize?: number
}>(), {
  pageSizes: () => [5, 10, 20],
  defaultPageSize: undefined,
})

// Inject blog posts from the parent BlogAwareLayout
const postsData = inject<Ref<BlogPost[]>>(blogPostsKey, ref([]))

const allPosts = computed<BlogPost[]>(() => postsData.value)
const searchQuery = ref('')
const activeTag = ref<'all' | string>('all')

// Pagination state
const pageSizeOptions = computed(() => [...props.pageSizes].sort((a, b) => a - b))
const pageSize = ref(props.defaultPageSize ?? pageSizeOptions.value[0] ?? 10)
const currentPage = ref(1)

// Reset to page 1 when filters change
watch([searchQuery, activeTag], () => {
  currentPage.value = 1
})

const availableTags = computed(() => {
  const tagSet = new Set<string>()
  for (const post of allPosts.value) {
    for (const tag of post.tags ?? []) {
      if (tag.trim()) tagSet.add(tag.trim())
    }
  }
  return Array.from(tagSet.values()).sort((a, b) => a.localeCompare(b))
})

const normalizedPosts = computed(() => {
  if (!searchQuery.value && activeTag.value === 'all') return allPosts.value

  const query = searchQuery.value.trim().toLowerCase()
  return allPosts.value.filter((post) => {
    const matchesQuery = query
      ? [post.title, post.description].some((value) =>
          value.toLowerCase().includes(query)
        )
      : true

    const matchesTag = activeTag.value === 'all'
      ? true
      : post.tags?.some((tag: string) => tag.toLowerCase() === activeTag.value.toLowerCase())

    return matchesQuery && matchesTag
  })
})

// Pagination computed properties
const totalPosts = computed(() => normalizedPosts.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalPosts.value / pageSize.value)))
const paginationStart = computed(() => totalPosts.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalPosts.value))

const filteredPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return normalizedPosts.value.slice(start, end)
})

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function setActiveTag(tag: string) {
  activeTag.value = tag as typeof activeTag.value
}

function formatDate(date: string) {
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) return date
  return dateFormatter.format(new Date(parsed))
}
</script>
