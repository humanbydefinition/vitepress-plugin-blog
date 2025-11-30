# Getting Started

## Installation

Install `vitepress-plugin-blog` using npm:

```bash
npm install vitepress-plugin-blog
```

## Setup

### 1. Create or update your theme

Create a theme file at `.vitepress/theme/index.ts`:

```ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme) satisfies Theme
```

### 2. Create your blog directory

Create a `blog/posts/` directory in your docs folder:

```
docs/
├── .vitepress/
│   └── theme/
│       └── index.ts
├── blog/
│   ├── index.md        # Blog listing page
│   └── posts/
│       └── my-post.md  # Your blog posts
└── index.md
```

### 3. Create a blog listing page

Create `blog/index.md` with the BlogHome component:

```markdown
---
title: Blog
---

<BlogHome />
```

### 4. Create your first post

Create a markdown file in `blog/posts/` with the following frontmatter:

```markdown
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

# My First Blog Post

Your content here...
```

## How It Works

The plugin:

1. Scans your `blog/posts/` directory for markdown files
2. Extracts frontmatter metadata (title, date, tags, etc.)
3. Automatically uses the BlogPostLayout for pages with `blogPost: true`
4. Provides global components for listing and displaying posts

## Next Steps

- Check out the [Configuration](/guide/configuration) options
- See the [Examples](/examples/) for more usage patterns
