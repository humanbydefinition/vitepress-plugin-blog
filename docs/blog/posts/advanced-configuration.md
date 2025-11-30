---
blogPost: true
title: Advanced Configuration Options
description: Dive deep into the configuration options available in vitepress-plugin-blog and learn how to customize every aspect of your blog.
date: 2024-01-20
author: humanbydefinition
tags:
  - vitepress
  - configuration
  - advanced
published: true
prev: false
next: false
---

# Advanced Configuration Options

Now that you've got the basics down, let's explore the advanced configuration options available in **vitepress-plugin-blog**.

## Custom Frontmatter Key

By default, the plugin uses `blogPost: true` to identify blog posts. You can customize this:

```typescript
withBlogTheme(DefaultTheme, {
  blogFrontmatterKey: 'isBlogPost',
})
```

## Frontmatter Fields

Here's a complete reference of all supported frontmatter fields:

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | The post title |
| `description` | `string` | A short excerpt |
| `date` | `string` | Publication date |
| `author` | `string` | Author name or GitHub username |
| `tags` | `string[]` | Categories for filtering |
| `cover` | `string` | Cover image path |
| `published` | `boolean` | Control visibility |
| `slug` | `string` | Custom URL slug |

## Author Avatars

If you use a GitHub username as the author, the plugin automatically fetches their avatar:

```markdown
---
author: humanbydefinition
---
```

This will display the GitHub avatar alongside the author name.

## Reading Time

Reading time is automatically calculated based on word count, assuming an average reading speed of 220 words per minute.

## Conclusion

With these configuration options, you have full control over how your blog looks and behaves. Experiment with different settings to find what works best for your documentation site!
