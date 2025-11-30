<template>
  <div class="blog-index__controls">
    <input
      :value="searchQuery"
      type="search"
      class="blog-index__search"
      placeholder="Search posts by title or description"
      aria-label="Search blog posts"
      @input="handleSearchInput"
    />

    <div v-if="tags.length" class="blog-index__filters">
      <button
        v-for="tag in ['all', ...tags]"
        :key="tag"
        type="button"
        class="blog-index__tag"
        :class="{ 'blog-index__tag--active': tag === activeTag }"
        @click="handleTagClick(tag)"
      >
        <span v-if="tag === 'all'">All posts</span>
        <span v-else>#{{ tag }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * BlogFilters Component
 *
 * Provides search input and tag filter buttons for the blog index.
 * Emits events when filters change.
 *
 * @component
 * @example
 * ```vue
 * <BlogFilters
 *   v-model:search-query="searchQuery"
 *   v-model:active-tag="activeTag"
 *   :tags="availableTags"
 * />
 * ```
 */

// ============================================================================
// Props & Emits
// ============================================================================

interface Props {
  /** Current search query */
  searchQuery: string
  /** Currently active tag filter ('all' or a tag name) */
  activeTag: string
  /** List of available tags to filter by */
  tags: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:searchQuery': [query: string]
  'update:activeTag': [tag: string]
}>()

// ============================================================================
// Event Handlers
// ============================================================================

function handleSearchInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

function handleTagClick(tag: string): void {
  emit('update:activeTag', tag)
}
</script>
