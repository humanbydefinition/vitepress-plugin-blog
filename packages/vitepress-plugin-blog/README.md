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
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme)
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

## Components

The plugin provides the following components:

### BlogPostList

A component that displays a filterable list of all blog posts with search and tag filtering.

```vue
<BlogPostList />
```

### BlogHome

A simple wrapper component for displaying blog posts on a home page.

```vue
<BlogHome />
```

## Configuration

```typescript
withBlogTheme(DefaultTheme, {
  // Frontmatter key that marks a page as a blog post (default: 'blogPost')
  blogFrontmatterKey: 'blogPost',
})
```

## Frontmatter Options

| Field | Type | Description |
|-------|------|-------------|
| `blogPost` | `boolean` | Mark this page as a blog post |
| `title` | `string` | Post title |
| `description` | `string` | Short description/excerpt |
| `date` | `string` | Publication date (YYYY-MM-DD) |
| `author` | `string` | Author name or GitHub username |
| `tags` | `string[]` | List of tags |
| `cover` | `string` | Cover image URL |
| `published` | `boolean` | Whether the post is published (default: true) |
| `slug` | `string` | Custom URL slug |

## License

MIT
