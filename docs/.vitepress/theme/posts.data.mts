// VitePress Data Loader for blog posts

import { createContentLoader } from 'vitepress'
import type { BlogPostEntry } from 'vitepress-plugin-blog'

declare const data: BlogPostEntry[]
export { data }

export default createContentLoader('blog/posts/**/*.md', {
  excerpt: true,
  includeSrc: true,
  transform(posts): BlogPostEntry[] {
    return posts
      .map((post) => {
        const frontmatter = post.frontmatter as Record<string, any>

        const sourcePath = (post as any).src ?? ''
        const date = frontmatter?.date ?? ''
        const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : []
        const author = frontmatter?.author ?? ''
        const permalink = post.url

        const sourceContent = (post as any).src ?? ''
        const words = typeof sourceContent === 'string' && sourceContent
          ? sourceContent.trim().split(/\s+/).filter(Boolean).length
          : 0
        const readingTime = Math.max(1, Math.round(words / 220))

        const rawDescription = frontmatter?.description ?? post.excerpt ?? ''
        const description = typeof rawDescription === 'string'
          ? rawDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          : ''

        const slug = frontmatter?.slug ?? 
          permalink.replace(/\/$/, '').split('/').pop()?.replace(/\.html$/, '') ?? 
          ''

        const published = frontmatter?.published ?? true

        return {
          title: frontmatter?.title ?? 'Untitled post',
          description,
          date,
          tags,
          author,
          url: permalink,
          slug,
          readingTime,
          cover: frontmatter?.cover ?? null,
          source: sourcePath,
          published,
        }
      })
      .filter((post) => post.published)
      .sort((a, b) => {
        const aTime = a.date ? Date.parse(a.date) : 0
        const bTime = b.date ? Date.parse(b.date) : 0
        return bTime - aTime
      })
  },
})
