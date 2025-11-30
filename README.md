# vitepress-plugin-blog

[![npm version](https://img.shields.io/npm/v/vitepress-plugin-blog.svg)](https://www.npmjs.com/package/vitepress-plugin-blog)
[![license](https://img.shields.io/npm/l/vitepress-plugin-blog.svg)](https://github.com/humanbydefinition/vitepress-plugin-blog/blob/main/LICENSE)

Add blog functionality to your VitePress documentation with automatic post discovery, layouts, and components.

## Features

- **Zero Config** - Works out of the box with sensible defaults
- **Automatic Post Discovery** - Automatically finds and loads blog posts from your markdown files
- **HMR Support** - Full hot module replacement support during development
- **Customizable** - Configure layouts, components, and frontmatter keys
- **Lightweight** - Minimal dependencies, built on VitePress's data loader API

## Installation

```bash
npm install vitepress-plugin-blog
```

## Usage

Add the plugin to your VitePress theme:

```typescript
// .vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme) satisfies Theme
```

That's it! Now you can create blog posts by adding markdown files with the `blogPost: true` frontmatter.

## Creating Blog Posts

Create markdown files in `blog/posts/` directory with the following frontmatter:

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
cover: /images/cover.jpg
---

Your blog post content here...
```

## Configuration

```typescript
withBlogTheme(DefaultTheme, {
  // Frontmatter key that marks a page as a blog post (default: 'blogPost')
  blogFrontmatterKey: 'blogPost',
})
```

## Development

```bash
# Install dependencies
npm install

# Build the plugin and start docs dev server
npm run dev

# Build everything for production
npm run build
```

## License

MIT
