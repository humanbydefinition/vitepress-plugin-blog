# Configuration

The `withBlogTheme` function accepts an options object to customize behavior.

## Options

```ts
interface BlogOptions {
  // Frontmatter key that marks a page as a blog post
  blogFrontmatterKey?: string
}
```

## Options Reference

### blogFrontmatterKey

The frontmatter key used to identify blog posts.

- **Type:** `string`
- **Default:** `'blogPost'`

When a page's frontmatter contains this key set to `true`, it will be rendered using the BlogPostLayout instead of the default layout.

```ts
withBlogTheme(DefaultTheme, {
  blogFrontmatterKey: 'isBlogPost', // Custom key
})
```

With this configuration, your posts would use:

```markdown
---
isBlogPost: true
title: My Post
---
```

## Frontmatter Options

Blog posts support the following frontmatter fields:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `blogPost` | `boolean` | Mark this page as a blog post | Required |
| `title` | `string` | Post title | `'Untitled post'` |
| `description` | `string` | Short description/excerpt | Extracted from content |
| `date` | `string` | Publication date (YYYY-MM-DD) | - |
| `author` | `string` | Author name or GitHub username | - |
| `tags` | `string[]` | List of tags for filtering | `[]` |
| `cover` | `string` | Cover image URL | - |
| `published` | `boolean` | Whether the post is published | `true` |
| `slug` | `string` | Custom URL slug | Derived from filename |

## Example Post

```markdown
---
blogPost: true
title: Building a Blog with VitePress
description: Learn how to create a beautiful blog using vitepress-plugin-blog
date: 2024-01-15
author: humanbydefinition
tags:
  - vitepress
  - tutorial
  - blog
cover: /images/blog-cover.jpg
published: true
---

# Building a Blog with VitePress

Your content here...
```

## Components

The plugin registers these global components:

### BlogPostList

Displays a filterable list of all blog posts with search and tag filtering.

```vue
<BlogPostList />
```

### BlogHome

A simple wrapper component for displaying the blog post list on a home page.

```vue
<BlogHome />
```

## Data Loader

The plugin uses VitePress's data loader API to discover blog posts. Posts are loaded from `blog/posts/**/*.md` by default.

The data loader provides:
- Automatic frontmatter extraction
- Computed reading time
- HMR support for live updates
- Sorted posts by date (newest first)
