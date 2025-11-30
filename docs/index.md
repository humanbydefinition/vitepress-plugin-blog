---
layout: home

hero:
  name: vitepress-plugin-blog
  tagline: Add blog functionality to your VitePress documentation with automatic post discovery, layouts, and components
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/humanbydefinition/vitepress-plugin-blog

features:
  - title: Zero Config
    details: Works out of the box with sensible defaults. Just install and use.
  - title: Automatic Post Discovery
    details: Automatically finds and loads blog posts from your markdown files using VitePress data loaders.
  - title: HMR Support
    details: Full hot module replacement support - posts update as you edit them.
  - title: Lightweight
    details: Minimal dependencies, built on VitePress's native data loader API.
---

## Quick Start

Install the plugin:

```bash
npm install vitepress-plugin-blog
```

Add it to your theme:

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme)
```

Create blog posts with frontmatter:

```markdown
---
blogPost: true
title: My First Post
description: A short description
date: 2024-01-15
tags:
  - vitepress
  - blog
---

Your content here...
```

That's it! Your blog posts will automatically be rendered with the blog layout.

