/**
 * Represents a blog post entry with all metadata.
 */
export interface BlogPostEntry {
  /** The title of the blog post */
  title: string
  /** A short description or excerpt of the post */
  description: string
  /** The publication date in ISO format (YYYY-MM-DD) */
  date: string
  /** Tags/categories for the post */
  tags: string[]
  /** The author's name or GitHub username */
  author: string
  /** The URL path to the post */
  url: string
  /** The URL slug for the post */
  slug: string
  /** Estimated reading time in minutes */
  readingTime: number
  /** Cover image URL, if any */
  cover: string | null
  /** Source file path */
  source: string
  /** Whether the post is published */
  published: boolean
}
