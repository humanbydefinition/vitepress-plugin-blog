# Configuration

This page covers all configuration options for `vitepress-plugin-blog`.

## Plugin Options

The `withBlogTheme` function accepts an options object:

```typescript
interface BlogOptions {
  /**
   * Frontmatter key that marks a page as a blog post.
   * @default 'blogPost'
   */
  blogFrontmatterKey?: string
}
```

### blogFrontmatterKey

Change the frontmatter key used to identify blog posts:

```typescript
// .vitepress/theme/index.ts
export default withBlogTheme(DefaultTheme, {
  blogFrontmatterKey: 'isBlogPost',
})
```

With this configuration, your posts would use:

```markdown
---
isBlogPost: true
title: My Post
---
```

## Sidebar Configuration

The plugin provides two functions for generating blog sidebars.

### generateBlogSidebarFromFiles

Recommended for most use cases. Reads markdown files synchronously at config load time:

```typescript
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { generateBlogSidebarFromFiles } from 'vitepress-plugin-blog/sidebar'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(__dirname, '..')

export default defineConfig({
  themeConfig: {
    sidebar: {
      '/blog/': generateBlogSidebarFromFiles(docsDir, {
        basePath: '/blog/',           // Base path for blog links
        recentPostsCount: 5,          // Number of recent posts
        allPostsLabel: 'All posts',   // Label for "all posts" link
        recentPostsLabel: 'Recent posts',
        recentPostsCollapsed: false,  // Collapse recent posts section
        postsPattern: 'blog/posts/**/*.md', // Glob pattern
      }),
    },
  },
})
```

### generateBlogSidebar

Use when you have posts data available (e.g., from a data loader):

```typescript
import { generateBlogSidebar } from 'vitepress-plugin-blog/sidebar'

// With pre-loaded posts data
const sidebar = generateBlogSidebar(posts, {
  recentPostsCount: 5,
})
```

## Component Configuration

### BlogIndex Props

The main blog listing component accepts these props:

```vue
<BlogIndex
  :page-sizes="[5, 10, 20]"
  :default-page-size="10"
  pagination="auto"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSizes` | `number[]` | `[5, 10, 20]` | Available page size options |
| `defaultPageSize` | `number` | First value in `pageSizes` | Initial page size |
| `pagination` | `'always'` \| `'auto'` \| `'never'` | `'auto'` | Controls pagination visibility |

### Pagination Visibility

The `pagination` prop controls when the pagination controls are displayed:

| Value | Behavior |
|-------|----------|
| `'always'` | Always show pagination, even with few posts |
| `'auto'` | Show only when posts exceed the page size (default) |
| `'never'` | Never show pagination controls |

```vue
<!-- Always show pagination -->
<BlogIndex pagination="always" />

<!-- Show only when needed (default) -->
<BlogIndex pagination="auto" />

<!-- Hide pagination entirely -->
<BlogIndex pagination="never" />
```

## Frontmatter Options

Full reference for blog post frontmatter:

```markdown
---
# Required
blogPost: true

# Metadata
title: My Blog Post
description: A short description for cards and SEO
date: 2024-01-15

# Author (GitHub username enables avatar)
author: humanbydefinition

# Categorization
tags:
  - vitepress
  - tutorial
  - vue

# Media
cover: /images/my-cover.jpg

# Publishing
published: true  # Set to false to hide from listings

# URL
slug: custom-slug  # Override the URL slug
---
```

## Custom Components

For advanced customization, import individual components:

```typescript
import {
  BlogIndex,        // Main listing with filters
  BlogCard,         // Individual post card
  BlogFilters,      // Search and tag filters
  BlogPagination,   // Pagination controls
  BlogPostLayout,   // Single post layout
} from 'vitepress-plugin-blog'
```

### BlogCard

Display a single post card:

```vue
<script setup>
import { BlogCard } from 'vitepress-plugin-blog'
</script>

<template>
  <BlogCard :post="post" />
</template>
```

### BlogFilters

Add search and filtering:

```vue
<script setup>
import { ref } from 'vue'
import { BlogFilters } from 'vitepress-plugin-blog'

const searchQuery = ref('')
const activeTag = ref('all')
const tags = ['vue', 'vitepress', 'tutorial']
</script>

<template>
  <BlogFilters
    v-model:search-query="searchQuery"
    v-model:active-tag="activeTag"
    :tags="tags"
  />
</template>
```

### BlogPagination

Add pagination controls:

```vue
<script setup>
import { ref } from 'vue'
import { BlogPagination } from 'vitepress-plugin-blog'

const currentPage = ref(1)
const pageSize = ref(10)
</script>

<template>
  <BlogPagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total-posts="100"
    :page-size-options="[5, 10, 20]"
  />
</template>
```

## Composables

### useBlogPosts

Access blog posts data in any component:

```vue
<script setup>
import { useBlogPosts } from 'vitepress-plugin-blog'

const { posts, totalPosts, allTags } = useBlogPosts()
</script>
```

**Returns:**
- `posts` - `Ref<BlogPostEntry[]>` - All blog posts
- `totalPosts` - `ComputedRef<number>` - Total post count
- `allTags` - `ComputedRef<string[]>` - All unique tags

### useBlogNavigation

Get current post and navigation:

```vue
<script setup>
import { useBlogNavigation } from 'vitepress-plugin-blog'

const { currentPost, prevPost, nextPost, currentIndex } = useBlogNavigation()
</script>
```

**Returns:**
- `currentPost` - Current post based on URL
- `prevPost` - Previous (newer) post
- `nextPost` - Next (older) post
- `currentIndex` - Index in posts array

## Utility Functions

```typescript
import {
  formatDate,          // (date: string) => string
  parseDate,           // (date: string) => number
  isGitHubUsername,    // (author: string) => boolean
  getGitHubAvatarUrl,  // (username: string, size?: number) => string
} from 'vitepress-plugin-blog'

// Examples
formatDate('2024-01-15')           // "January 15, 2024"
parseDate('2024-01-15')            // 1705276800000
isGitHubUsername('octocat')        // true
isGitHubUsername('John Doe')       // false
getGitHubAvatarUrl('octocat')      // "https://github.com/octocat.png"
getGitHubAvatarUrl('octocat', 40)  // "https://github.com/octocat.png?size=40"
```

## TypeScript

The plugin exports all types:

```typescript
import type {
  BlogPostEntry,
  BlogOptions,
  SidebarItem,
  BlogSidebarOptions,
  UseBlogPostsReturn,
  UseBlogNavigationReturn,
} from 'vitepress-plugin-blog'
```
