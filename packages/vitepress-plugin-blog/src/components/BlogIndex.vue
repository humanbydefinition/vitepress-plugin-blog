<template>
  <div class="blog-index">
    <!-- Search and Filter Controls -->
    <BlogFilters
      v-model:search-query="searchQuery"
      v-model:active-tag="activeTag"
      :tags="availableTags"
    />

    <!-- Post Grid -->
    <div v-if="paginatedPosts.length" class="blog-index__grid">
      <BlogCard
        v-for="post in paginatedPosts"
        :key="post.url"
        :post="post"
      />
    </div>

    <!-- Empty State -->
    <p v-else class="blog-index__empty">
      No posts matched your filters. Try clearing the search or choosing a different tag.
    </p>

    <!-- Pagination -->
    <BlogPagination
      v-if="showPagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-posts="filteredPosts.length"
      :page-size-options="pageSizeOptions"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * BlogIndex Component
 *
 * Main blog listing component that displays a searchable, filterable grid
 * of blog post cards with pagination.
 *
 * Uses child components for better separation of concerns:
 * - BlogFilters: Search and tag filtering
 * - BlogCard: Individual post cards
 * - BlogPagination: Page navigation
 *
 * @component
 * @example
 * ```vue
 * <!-- Basic usage -->
 * <BlogIndex />
 *
 * <!-- With custom pagination options -->
 * <BlogIndex :page-sizes="[5, 10, 20]" :default-page-size="10" />
 *
 * <!-- Control pagination visibility -->
 * <BlogIndex pagination="always" />
 * <BlogIndex pagination="auto" />
 * <BlogIndex pagination="never" />
 * ```
 */
import { computed, ref, watch } from 'vue'
import { useBlogPosts } from '../composables/useBlogPosts'
import BlogFilters from './BlogFilters.vue'
import BlogCard from './BlogCard.vue'
import BlogPagination from './BlogPagination.vue'

// ============================================================================
// Types
// ============================================================================

/**
 * Controls when pagination is displayed.
 * - 'always': Always show pagination controls
 * - 'auto': Show only when there are more posts than fit on one page (default)
 * - 'never': Never show pagination controls
 */
type PaginationVisibility = 'always' | 'auto' | 'never'

// ============================================================================
// Props
// ============================================================================

interface Props {
  /**
   * Available page size options for the user to choose from.
   * If only one value is provided, the page size selector is hidden.
   */
  pageSizes?: number[]
  /**
   * Initial page size. Defaults to the first value in pageSizes.
   */
  defaultPageSize?: number
  /**
   * Controls when pagination is displayed.
   * - 'always': Always show pagination controls
   * - 'auto': Show only when needed (default)
   * - 'never': Never show pagination controls
   */
  pagination?: PaginationVisibility
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [5, 10, 20],
  defaultPageSize: undefined,
  pagination: 'auto',
})

// ============================================================================
// State
// ============================================================================

const { posts, allTags: availableTags } = useBlogPosts()

const searchQuery = ref('')
const activeTag = ref<string>('all')
const currentPage = ref(1)

const pageSizeOptions = computed(() =>
  [...props.pageSizes].sort((a, b) => a - b)
)

const pageSize = ref(
  props.defaultPageSize ?? pageSizeOptions.value[0] ?? 10
)

// Reset to page 1 when filters change
watch([searchQuery, activeTag], () => {
  currentPage.value = 1
})

// ============================================================================
// Computed
// ============================================================================

/**
 * Posts filtered by search query and active tag.
 */
const filteredPosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const tag = activeTag.value

  if (!query && tag === 'all') {
    return posts.value
  }

  return posts.value.filter((post) => {
    // Check search query
    const matchesQuery = !query || [post.title, post.description]
      .some((text) => text.toLowerCase().includes(query))

    // Check tag filter
    const matchesTag = tag === 'all' || post.tags?.some(
      (t) => t.toLowerCase() === tag.toLowerCase()
    )

    return matchesQuery && matchesTag
  })
})

/**
 * Paginated subset of filtered posts.
 */
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPosts.value.slice(start, start + pageSize.value)
})

/**
 * Whether to show the pagination controls.
 * Based on the pagination prop:
 * - 'always': Always show
 * - 'auto': Show only when there are more posts than fit on one page
 * - 'never': Never show
 */
const showPagination = computed(() => {
  if (props.pagination === 'never') return false
  if (props.pagination === 'always') return true
  
  // 'auto' mode: show only when there are multiple pages
  const totalPages = Math.ceil(filteredPosts.value.length / pageSize.value)
  return totalPages > 1
})
</script>
