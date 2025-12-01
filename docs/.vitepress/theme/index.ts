import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { withBlogTheme } from 'vitepress-plugin-blog'
import 'vitepress-plugin-blog/style.css'

export default withBlogTheme(DefaultTheme) satisfies Theme
