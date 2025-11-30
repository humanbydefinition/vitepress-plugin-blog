# Examples

This page demonstrates the blog plugin in action.

## Blog Components

### BlogHome Component

The `BlogHome` component displays a list of blog posts. You can use it on any page:

```vue
<BlogHome />
```

### BlogPostList Component

The `BlogPostList` component provides search and tag filtering:

```vue
<BlogPostList />
```

## Demo

Check out our [blog section](/blog/) to see the plugin in action with sample posts.

## Creating Posts

Here's a complete example of a blog post:

```markdown
---
blogPost: true
title: Getting Started with VitePress Plugin Blog
description: Learn how to add blog functionality to your VitePress site
date: 2024-01-15
author: humanbydefinition
tags:
  - vitepress
  - tutorial
  - getting-started
cover: /images/getting-started.jpg
---

# Getting Started with VitePress Plugin Blog

This is your blog post content. You can use all standard Markdown features...

## Code Examples

\`\`\`javascript
console.log('Hello, blog!')
\`\`\`

## Images

![Alt text](/path/to/image.jpg)
```

## Directory Structure

A typical blog setup looks like:

```
docs/
├── .vitepress/
│   ├── config.mts
│   └── theme/
│       └── index.ts
├── blog/
│   ├── index.md          # Blog listing page
│   └── posts/
│       ├── first-post.md
│       └── second-post.md
├── public/
│   └── images/
│       └── covers/
└── index.md
```
