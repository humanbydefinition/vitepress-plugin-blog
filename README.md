# vitepress-plugin-blog

[![npm version](https://img.shields.io/npm/v/vitepress-plugin-blog.svg)](https://www.npmjs.com/package/vitepress-plugin-blog)
[![license](https://img.shields.io/npm/l/vitepress-plugin-blog.svg)](https://github.com/humanbydefinition/vitepress-plugin-blog/blob/main/LICENSE)

Add blog functionality to your VitePress documentation with automatic post discovery, layouts, and components.

## ✨ Features

- **🚀 Zero Config** - Works out of the box with sensible defaults
- **📝 Automatic Post Discovery** - Finds and loads blog posts from your markdown files
- **🔥 Full HMR Support** - Posts, blog listing, and sidebar update instantly during development
- **🎨 Beautiful Components** - Pre-styled blog index, cards, filters, and pagination
- **🔍 Search & Filtering** - Built-in search and tag filtering
- **📖 Reading Time** - Automatic reading time calculation
- **👤 GitHub Avatars** - Auto-fetches avatars for GitHub usernames
- **📑 Sidebar Generation** - Helper functions with HMR support for VitePress sidebar
- **🎛️ Customizable** - Export individual components and composables for custom layouts
- **📦 Lightweight** - Minimal dependencies, uses Vite virtual modules

## 📦 Installation

```bash
npm install vitepress-plugin-blog
```

## 🚀 Quick Start

### 1. Add the Vite plugin

```typescript
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { blogPlugin } from 'vitepress-plugin-blog/plugin'

export default defineConfig({
  vite: {
    plugins: [blogPlugin()]
  }
})
```

### 2. Set up your theme

```typescript
// .vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme) satisfies Theme
```

### 3. Create the blog structure

```
docs/
├── .vitepress/
│   ├── config.mts
│   └── theme/
│       └── index.ts
├── blog/
│   ├── index.md          # Blog listing page
│   └── posts/
│       └── my-first-post.md
└── index.md
```

### 4. Create a blog listing page

```markdown
<!-- blog/index.md -->
---
title: Blog
aside: false
---

# Blog

<BlogIndex />
```

### 5. Write your first post

```markdown
<!-- blog/posts/my-first-post.md -->
---
blogPost: true
title: My First Blog Post
description: A short description of my post
date: 2024-01-15
author: your-github-username
tags:
  - vitepress
  - blog
---

Your content here...
```

That's it! Your blog is ready. 🎉

## 📝 Post Frontmatter

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `blogPost` | `boolean` | **Required.** Marks the page as a blog post | - |
| `title` | `string` | Post title | `'Untitled post'` |
| `description` | `string` | Short description/excerpt | Auto-extracted |
| `date` | `string` | Publication date (YYYY-MM-DD) | - |
| `author` | `string` | Author name or GitHub username | `'Anonymous'` |
| `tags` | `string[]` | Tags for filtering | `[]` |
| `cover` | `string` | Cover image URL | - |
| `published` | `boolean` | Set to `false` to hide the post | `true` |
| `slug` | `string` | Custom URL slug | From filename |

## ⚙️ Configuration

### Vite Plugin Options

```typescript
blogPlugin({
  postsDir: 'blog/posts',     // Directory containing blog posts
  wordsPerMinute: 220,        // For reading time calculation
  sidebar: {                   // Enable sidebar HMR (optional)
    recentPostsCount: 5,
  },
})
```

### Theme Options

```typescript
withBlogTheme(DefaultTheme, {
  // Frontmatter key that marks a page as a blog post
  blogFrontmatterKey: 'blogPost', // default
})
```

### Sidebar Generation with HMR

Generate a blog sidebar with full HMR support:

```typescript
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { generateBlogSidebarFromFiles } from 'vitepress-plugin-blog/sidebar'
import { blogPlugin } from 'vitepress-plugin-blog/plugin'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(__dirname, '..')

// Share options between static generation and HMR
const sidebarOptions = {
  recentPostsCount: 5,
  allPostsLabel: 'All posts',
  recentPostsLabel: 'Recent posts',
  recentPostsCollapsed: false,
}

export default defineConfig({
  vite: {
    plugins: [
      blogPlugin({
        sidebar: sidebarOptions, // Enable sidebar HMR
      })
    ]
  },
  themeConfig: {
    sidebar: {
      '/blog/': generateBlogSidebarFromFiles(docsDir, sidebarOptions),
    },
  },
})
```

## 🧩 Components

### BlogIndex

The main blog listing component with search, filtering, and pagination.

```vue
<!-- Basic usage -->
<BlogIndex />

<!-- With custom pagination -->
<BlogIndex :page-sizes="[5, 10, 20]" :default-page-size="10" />

<!-- Control pagination visibility -->
<BlogIndex pagination="always" />
<BlogIndex pagination="auto" />   <!-- default -->
<BlogIndex pagination="never" />
```

**Props:**
- `pageSizes` - Array of page size options (default: `[5, 10, 20]`)
- `defaultPageSize` - Initial page size (default: first value in `pageSizes`)
- `pagination` - Controls visibility: `'always'` | `'auto'` | `'never'` (default: `'auto'`)

### Individual Components

For custom layouts, import components individually:

```typescript
import {
  BlogCard,        // Individual post card
  BlogFilters,     // Search and tag filters
  BlogPagination,  // Pagination controls
  BlogPostLayout,  // Single post layout
} from 'vitepress-plugin-blog'
```

## 🪝 Composables

### useBlogPosts

Access blog posts data in any component:

```vue
<script setup>
import { useBlogPosts } from 'vitepress-plugin-blog'

const { posts, totalPosts, allTags } = useBlogPosts()
</script>
```

**Returns:**
- `posts` - Reactive array of all blog posts
- `totalPosts` - Computed post count
- `allTags` - Computed array of unique tags

### useBlogNavigation

Get previous/next post navigation:

```vue
<script setup>
import { useBlogNavigation } from 'vitepress-plugin-blog'

const { currentPost, prevPost, nextPost } = useBlogNavigation()
</script>
```

**Returns:**
- `currentPost` - The current post based on page URL
- `prevPost` - Previous (newer) post
- `nextPost` - Next (older) post
- `currentIndex` - Index in posts array

### useBlogSidebar

Access sidebar data (used internally for HMR):

```vue
<script setup>
import { useBlogSidebar } from 'vitepress-plugin-blog'

const { sidebar, initialized } = useBlogSidebar()
</script>
```

## 🛠️ Utilities

```typescript
import {
  formatDate,          // Format date strings
  parseDate,           // Parse date to timestamp
  isGitHubUsername,    // Check if string is a GitHub username
  getGitHubAvatarUrl,  // Get GitHub avatar URL
} from 'vitepress-plugin-blog'
```

## 📁 Project Structure

```
vitepress-plugin-blog/
├── src/
│   ├── components/
│   │   ├── BlogIndex.vue      # Main listing component
│   │   ├── BlogCard.vue       # Post card component
│   │   ├── BlogFilters.vue    # Search & tag filters
│   │   └── BlogPagination.vue # Pagination controls
│   ├── composables/
│   │   ├── useBlogPosts.ts    # Posts data composable
│   │   ├── useBlogNavigation.ts # Navigation composable
│   │   └── useBlogSidebar.ts  # Sidebar HMR composable
│   ├── layouts/
│   │   └── BlogPostLayout.vue # Single post layout
│   ├── utils/
│   │   ├── date.ts            # Date utilities
│   │   └── author.ts          # Author utilities
│   ├── styles/
│   │   └── blog.css           # Plugin styles
│   ├── plugin.ts              # Vite plugin (blogPlugin)
│   ├── sidebar.ts             # Sidebar generation
│   ├── types.ts               # TypeScript types
│   └── index.ts               # Main entry point
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run plugin:build

# Start docs dev server
npm run dev

# Build everything for production
npm run build
```
