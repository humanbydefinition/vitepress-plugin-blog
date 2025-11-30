import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import { data as posts } from './posts.data.mts'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme, {
  blogFrontmatterKey: 'blogPost',
  posts,
}) satisfies Theme
