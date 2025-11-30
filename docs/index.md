---
layout: home

hero:
  name: vitepress-plugin-blog
  text: Blog for VitePress
  tagline: Add beautiful blog functionality to your VitePress documentation with minimal configuration
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/humanbydefinition/vitepress-plugin-blog

features:
  - icon: 🚀
    title: Zero Config
    details: Works out of the box with sensible defaults. Just install, set up your theme, and start writing.
  - icon: 📝
    title: Automatic Post Discovery
    details: Automatically finds and loads blog posts from your markdown files using VitePress data loaders.
  - icon: 🔥
    title: HMR Support
    details: Full hot module replacement - posts update instantly as you edit them during development.
  - icon: 🔍
    title: Search & Filtering
    details: Built-in search by title/description and tag filtering. Find posts quickly.
  - icon: 📖
    title: Reading Time
    details: Automatic reading time calculation based on word count. Helps readers know what to expect.
  - icon: 👤
    title: GitHub Avatars
    details: Automatically fetches and displays GitHub avatars for authors using their username.
  - icon: 📑
    title: Sidebar Generation
    details: Helper functions to generate VitePress sidebar config with recent posts.
  - icon: 🎛️
    title: Fully Customizable
    details: Export individual components and composables for building custom layouts.
---

## Quick Start

### 1. Install the plugin

```bash
npm install vitepress-plugin-blog
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

### 3. Create a blog listing page

```markdown
<!-- blog/index.md -->
---
title: Blog
aside: false
---

# Blog

<BlogIndex />
```

### 4. Write your first post

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

That's it! Your blog is ready. Check out the [Getting Started](/guide/getting-started) guide for more details.

## Components

The plugin provides several components for different use cases:

| Component | Description |
|-----------|-------------|
| `<BlogIndex />` | Main blog listing with search, filters, and pagination |
| `BlogCard` | Individual post card (for custom layouts) |
| `BlogFilters` | Search and tag filter controls |
| `BlogPagination` | Pagination controls |
| `BlogPostLayout` | Layout for individual posts |

### BlogIndex Props

```vue
<BlogIndex
  :page-sizes="[5, 10, 20]"
  :default-page-size="10"
  pagination="auto"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSizes` | `number[]` | `[5, 10, 20]` | Page size options |
| `defaultPageSize` | `number` | First in `pageSizes` | Initial page size |
| `pagination` | `string` | `'auto'` | `'always'` \| `'auto'` \| `'never'` |

## Composables

Build custom blog experiences with these composables:

```typescript
import { useBlogPosts, useBlogNavigation } from 'vitepress-plugin-blog'

// Access all posts
const { posts, totalPosts, allTags } = useBlogPosts()

// Get prev/next navigation
const { currentPost, prevPost, nextPost } = useBlogNavigation()
```

## Frontmatter Reference

| Field | Type | Description |
|-------|------|-------------|
| `blogPost` | `boolean` | **Required.** Marks the page as a blog post |
| `title` | `string` | Post title |
| `description` | `string` | Short description/excerpt |
| `date` | `string` | Publication date (YYYY-MM-DD) |
| `author` | `string` | Author name or GitHub username |
| `tags` | `string[]` | Tags for filtering |
| `cover` | `string` | Cover image URL |
| `published` | `boolean` | Set to `false` to hide the post |

