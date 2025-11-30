<template>
  <div 
    v-if="totalPages > 1 || showPageSizeSelector" 
    class="blog-index__pagination"
  >
    <div class="blog-index__pagination-info">
      Showing {{ startItem }}-{{ endItem }} of {{ totalPosts }} posts
    </div>

    <div class="blog-index__pagination-controls">
      <button
        type="button"
        class="blog-index__pagination-btn"
        :disabled="currentPage === 1"
        aria-label="First page"
        @click="goToPage(1)"
      >
        ««
      </button>
      <button
        type="button"
        class="blog-index__pagination-btn"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="goToPage(currentPage - 1)"
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
        aria-label="Next page"
        @click="goToPage(currentPage + 1)"
      >
        »
      </button>
      <button
        type="button"
        class="blog-index__pagination-btn"
        :disabled="currentPage === totalPages"
        aria-label="Last page"
        @click="goToPage(totalPages)"
      >
        »»
      </button>
    </div>

    <div v-if="showPageSizeSelector" class="blog-index__page-size">
      <label for="blog-page-size">Posts per page:</label>
      <select
        id="blog-page-size"
        :value="pageSize"
        class="blog-index__page-size-select"
        @change="handlePageSizeChange"
      >
        <option 
          v-for="size in pageSizeOptions" 
          :key="size" 
          :value="size"
        >
          {{ size }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * BlogPagination Component
 * 
 * Provides pagination controls for the blog post list.
 * Includes page navigation and optional page size selector.
 * 
 * @component
 */
import { computed } from 'vue'

// ============================================================================
// Props & Emits
// ============================================================================

interface Props {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Number of items per page */
  pageSize: number
  /** Total number of posts */
  totalPosts: number
  /** Available page size options */
  pageSizeOptions: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
}>()

// ============================================================================
// Computed
// ============================================================================

const totalPages = computed(() => 
  Math.max(1, Math.ceil(props.totalPosts / props.pageSize))
)

const startItem = computed(() => 
  props.totalPosts === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1
)

const endItem = computed(() => 
  Math.min(props.currentPage * props.pageSize, props.totalPosts)
)

const showPageSizeSelector = computed(() => 
  props.pageSizeOptions.length > 1
)

// ============================================================================
// Methods
// ============================================================================

function goToPage(page: number): void {
  emit('update:currentPage', page)
}

function handlePageSizeChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:pageSize', Number(target.value))
  emit('update:currentPage', 1) // Reset to first page
}
</script>
