---
blogPost: true
title: Building Custom Blog Components
description: Learn how to create your own custom components that integrate seamlessly with the blog plugin's data system.
date: 2024-01-25
author: humanbydefinition
tags:
  - vitepress
  - vue
  - components
  - customization
published: true
prev: false
next: false
---

# Building Custom Blog Components

One of the most powerful features of **vitepress-plugin-blog** is the ability to create custom components that have full access to your blog post data.

## Accessing Blog Posts

The plugin provides blog posts through Vue's dependency injection. Here's how to access them in your custom component:

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { blogPostsKey } from 'vitepress-plugin-blog'

const posts = inject(blogPostsKey)
</script>
```

## Example: Featured Posts Component

Let's build a component that displays the three most recent posts:

```vue
<template>
  <div class="featured-posts">
    <h2>Featured Posts</h2>
    <div class="posts-grid">
      <article v-for="post in featuredPosts" :key="post.url">
        <a :href="post.url">
          <h3>{{ post.title }}</h3>
          <p>{{ post.description }}</p>
        </a>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { blogPostsKey } from 'vitepress-plugin-blog'

const posts = inject(blogPostsKey)

const featuredPosts = computed(() => {
  return posts?.value?.slice(0, 3) ?? []
})
</script>
```

## Example: Tag Cloud Component

Here's another useful component - a tag cloud that shows all tags with their frequency:

```vue
<script setup lang="ts">
import { computed, inject } from 'vue'
import { blogPostsKey } from 'vitepress-plugin-blog'

const posts = inject(blogPostsKey)

const tagCounts = computed(() => {
  const counts = new Map<string, number>()
  
  posts?.value?.forEach(post => {
    post.tags?.forEach(tag => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    })
  })
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
})
</script>
```

## Registering Custom Components

You can register your components globally in your theme:

```typescript
// .vitepress/theme/index.ts
import { withBlogTheme } from 'vitepress-plugin-blog'
import FeaturedPosts from './components/FeaturedPosts.vue'
import TagCloud from './components/TagCloud.vue'

const theme = withBlogTheme(DefaultTheme, { posts })

theme.enhanceApp = ({ app }) => {
  app.component('FeaturedPosts', FeaturedPosts)
  app.component('TagCloud', TagCloud)
}

export default theme
```

## Conclusion

The injection-based architecture makes it easy to build powerful custom components. Whether you need a newsletter signup widget, related posts section, or author bio card - you have full access to all the blog data you need!
