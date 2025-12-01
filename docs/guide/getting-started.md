# Getting Started

This guide will walk you through setting up `vitepress-plugin-blog` in your VitePress project.

## Installation

Install the plugin using your preferred package manager:

::: code-group

```bash [npm]
npm install vitepress-plugin-blog
```

```bash [pnpm]
pnpm add vitepress-plugin-blog
```

```bash [yarn]
yarn add vitepress-plugin-blog
```

:::

## Setup

### 1. Add the Vite plugin

Update your `.vitepress/config.mts` to include the blog plugin:

```typescript
import { defineConfig } from 'vitepress'
import { blogPlugin } from 'vitepress-plugin-blog/plugin'

export default defineConfig({
  vite: {
    plugins: [
      blogPlugin()
    ]
  }
})
```

The `blogPlugin` automatically:
- Scans the `blog/posts/` directory for markdown files
- Extracts frontmatter and calculates reading time
- Provides data via virtual modules
- Enables full HMR support during development

### 2. Configure your theme

Create or update your theme file at `.vitepress/theme/index.ts`:

```typescript
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme) satisfies Theme
```

The `withBlogTheme` function wraps your base theme and adds:
- Automatic blog post layout switching
- Global blog components (`BlogIndex`, `BlogPostList`, `BlogHome`)
- HMR listener setup for live updates during development

### 2. Create your blog directory structure

Create the following structure in your docs folder:

```
docs/
├── .vitepress/
│   ├── config.mts
│   └── theme/
│       └── index.ts
├── blog/
│   ├── index.md          # Blog listing page
│   └── posts/
│       ├── my-first-post.md
│       └── another-post.md
└── index.md
```

### 3. Create the blog listing page

Create `blog/index.md` with the `BlogIndex` component:

```markdown
---
title: Blog
aside: false
prev: false
next: false
---

# Blog

Welcome to my blog! Here you'll find articles about...

<BlogIndex />
```

::: tip
Setting `aside: false` gives the blog listing more horizontal space by hiding the sidebar on the right.
:::

### 4. Write your first blog post

Create a markdown file in `blog/posts/` with blog frontmatter:

```markdown
---
blogPost: true
title: My First Blog Post
description: Learn how I set up my blog with VitePress
date: 2024-01-15
author: your-github-username
tags:
  - vitepress
  - tutorial
---

# My First Blog Post

Welcome to my blog! This is my first post...
```

### 5. (Optional) Add blog sidebar with HMR

Update your `.vitepress/config.mts` to include a blog sidebar. For the best development experience, pass the same sidebar options to both `blogPlugin()` and `generateBlogSidebarFromFiles()`:

```typescript
import { defineConfig } from 'vitepress'
import { generateBlogSidebarFromFiles } from 'vitepress-plugin-blog/sidebar'
import { blogPlugin } from 'vitepress-plugin-blog/plugin'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(__dirname, '..')

// Shared sidebar options for static generation and HMR
const sidebarOptions = {
  recentPostsCount: 5,
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

::: tip Sidebar HMR
By passing `sidebar` options to `blogPlugin()`, the sidebar's "Recent posts" section will update automatically when you edit blog post titles during development—no page reload required!
:::

## How It Works

The plugin uses a Vite plugin (`blogPlugin`) combined with a theme wrapper (`withBlogTheme`) to:

1. **Scan** the `blog/posts/` directory for markdown files
2. **Extract** frontmatter metadata (title, date, tags, etc.)
3. **Calculate** reading time based on word count
4. **Sort** posts by date (newest first)
5. **Filter** out unpublished posts (`published: false`)
6. **Provide** data via virtual modules for optimal SSR/SSG support

When you mark a page with `blogPost: true`, it automatically:
- Uses the `BlogPostLayout` instead of the default layout
- Shows post metadata (author, date, reading time)
- Displays previous/next navigation

### HMR (Hot Module Replacement)

During development, changes to blog posts are reflected instantly:

- **Post content**: Updates as you type
- **Blog listing**: Updates when posts are added, removed, or modified
- **Sidebar**: "Recent posts" titles update when you edit post titles (requires `sidebar` option in `blogPlugin`)

## Frontmatter Reference

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `blogPost` | `boolean` | ✅ | - | Marks the page as a blog post |
| `title` | `string` | - | `'Untitled post'` | Post title |
| `description` | `string` | - | Auto-extracted | Short description |
| `date` | `string` | - | - | Publication date (YYYY-MM-DD) |
| `author` | `string` | - | `'Anonymous'` | Author name or GitHub username |
| `tags` | `string[]` | - | `[]` | Tags for filtering |
| `cover` | `string` | - | - | Cover image URL |
| `published` | `boolean` | - | `true` | Set to `false` to hide |
| `slug` | `string` | - | From filename | Custom URL slug |

## Next Steps

- Learn about [Configuration](/guide/configuration) options
- Visit the [Blog](/blog/) to see the plugin in action
