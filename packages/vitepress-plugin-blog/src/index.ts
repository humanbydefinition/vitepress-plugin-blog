/**
 * vitepress-plugin-blog
 *
 * A VitePress plugin for adding blog functionality with automatic post discovery,
 * layouts, and components.
 *
 * @packageDocumentation
 */

import DefaultTheme from 'vitepress/theme'
import type { Theme, EnhanceAppContext } from 'vitepress'
import { defineComponent, h, provide, ref, onMounted } from 'vue'
import { useData } from 'vitepress'

// Internal imports
import BlogPostLayout from './layouts/BlogPostLayout.vue'
import BlogIndex from './components/BlogIndex.vue'
import BlogCard from './components/BlogCard.vue'
import BlogFilters from './components/BlogFilters.vue'
import BlogPagination from './components/BlogPagination.vue'
import { blogPostsKey } from './injectionKeys'
import type { BlogPostEntry } from './types'

// ============================================================================
// Shared State for HMR
// ============================================================================

/**
 * Shared reactive state for blog posts that persists across component instances.
 * This ensures HMR updates are reflected globally, not just in a single component instance.
 */
const globalPostsRef = ref<BlogPostEntry[]>([])

/**
 * Flag to track if HMR listener has been registered.
 * Prevents duplicate listener registrations.
 */
let hmrListenerRegistered = false

/**
 * Sets up the HMR listener for blog posts updates.
 * Called during component mount to ensure it runs in browser context.
 */
function setupHmrListener(): void {
  if (hmrListenerRegistered) return
  hmrListenerRegistered = true

  // Access import.meta.hot dynamically to prevent tree-shaking
  // We need to use a runtime check that the bundler can't optimize away
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaObj = import.meta as any
    const hot = metaObj.hot
    if (hot && typeof hot.on === 'function') {
      hot.on('blog-posts-update', (newPosts: BlogPostEntry[]) => {
        console.log('[vitepress-plugin-blog] HMR update received:', Array.isArray(newPosts) ? newPosts.length : 0, 'posts')
        if (Array.isArray(newPosts)) {
          // Create a new array to ensure Vue detects the change
          globalPostsRef.value = [...newPosts]
        }
      })
      console.log('[vitepress-plugin-blog] HMR listener registered')
    }
  } catch {
    // HMR not available (production build or SSR)
  }
}

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the blog plugin.
 */
export interface BlogOptions {
  /**
   * Frontmatter key that marks a page as a blog post.
   * When a page's frontmatter contains this key set to `true`,
   * it will be rendered using the BlogPostLayout.
   *
   * @default 'blogPost'
   *
   * @example
   * ```yaml
   * ---
   * blogPost: true
   * title: My First Post
   * ---
   * ```
   */
  blogFrontmatterKey?: string

  /**
   * Blog posts data. If not provided, the plugin will automatically
   * load posts from the injected script tag (requires blogPlugin() in vite config).
   *
   * @deprecated Passing posts data is no longer required. Use blogPlugin() in your Vite config instead.
   */
  posts?: BlogPostEntry[]
}

// ============================================================================
// Public Exports
// ============================================================================

// Types
export type { BlogPostEntry, PaginationVisibility } from './types'

// Components (BlogIndex is the main component, others available for customization)
export { BlogIndex, BlogCard, BlogFilters, BlogPagination, BlogPostLayout }

// Legacy aliases for backward compatibility
/** @deprecated Use BlogIndex instead */
export { BlogIndex as BlogPostList }
/** @deprecated Use BlogIndex instead */
export { BlogIndex as BlogHome }

// Composables
export { useBlogPosts, useBlogNavigation } from './composables'
export type { UseBlogPostsReturn, UseBlogNavigationReturn } from './composables'

// Utilities
export { formatDate, parseDate } from './utils/date'
export { isGitHubUsername, getGitHubAvatarUrl } from './utils/author'

// Injection Keys (for advanced usage)
export { blogPostsKey } from './injectionKeys'

// Sidebar utilities (prefer importing from 'vitepress-plugin-blog/sidebar')
export { generateBlogSidebar, generateBlogSidebarFromFiles } from './sidebar'
export type { SidebarItem, BlogSidebarOptions } from './sidebar'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Loads blog posts from the injected script tag in the HTML.
 * This is populated by blogPlugin() at build time.
 */
function loadPostsFromDOM(): BlogPostEntry[] {
  if (typeof document === 'undefined') return []
  
  const scriptEl = document.getElementById('vitepress-blog-posts')
  if (!scriptEl?.textContent) return []
  
  try {
    const posts = JSON.parse(scriptEl.textContent)
    return Array.isArray(posts) ? posts : []
  } catch {
    return []
  }
}

// ============================================================================
// Main Plugin Function
// ============================================================================

/**
 * Wraps an existing VitePress theme with blog functionality.
 *
 * This function returns a new theme that:
 * - Automatically uses BlogPostLayout for pages with the blog frontmatter flag
 * - Registers BlogIndex, BlogPostList and BlogHome as global components
 * - Provides blog posts data to all components via Vue's provide/inject
 * - Automatically loads posts from the injected script (when using blogPlugin())
 *
 * @param baseTheme - The base VitePress theme to extend (defaults to DefaultTheme)
 * @param options - Configuration options for the blog plugin
 * @returns A new VitePress theme with blog functionality
 *
 * @example
 * Minimal setup (recommended):
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress'
 * import { blogPlugin } from 'vitepress-plugin-blog'
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [blogPlugin()]
 *   }
 * })
 *
 * // .vitepress/theme/index.ts
 * import DefaultTheme from 'vitepress/theme'
 * import { withBlogTheme } from 'vitepress-plugin-blog'
 * import 'vitepress-plugin-blog/style.css'
 *
 * export default withBlogTheme(DefaultTheme)
 * ```
 *
 * @example
 * With custom frontmatter key:
 * ```ts
 * export default withBlogTheme(DefaultTheme, {
 *   blogFrontmatterKey: 'isBlogPost'
 * })
 * ```
 */
export function withBlogTheme(
  baseTheme: Theme = DefaultTheme,
  options: BlogOptions = {}
): Theme {
  const blogFlagKey = options.blogFrontmatterKey ?? 'blogPost'
  const BaseLayout = baseTheme.Layout ?? DefaultTheme.Layout

  // Initialize global posts with options.posts if provided (legacy support)
  if (options.posts && options.posts.length > 0 && globalPostsRef.value.length === 0) {
    globalPostsRef.value = options.posts
  }

  /**
   * Layout component that switches between blog and default layouts
   * based on frontmatter.
   */
  const BlogAwareLayout = defineComponent({
    name: 'BlogAwareLayout',
    setup(_, { slots }) {
      const { frontmatter } = useData()

      // Register HMR listener once (globally)
      // This ensures updates are reflected in the shared state
      setupHmrListener()

      // Load posts from DOM on mount (client-side only)
      onMounted(() => {
        if (globalPostsRef.value.length === 0) {
          const loadedPosts = loadPostsFromDOM()
          if (loadedPosts.length > 0) {
            globalPostsRef.value = loadedPosts
          }
        }
      })

      // Provide the global posts ref to all child components
      // Using the shared ref ensures HMR updates propagate correctly
      provide(blogPostsKey, globalPostsRef)

      return () => {
        // Use BlogPostLayout for pages marked as blog posts
        if (frontmatter.value?.[blogFlagKey] === true) {
          return h(BlogPostLayout, { posts: globalPostsRef.value })
        }

        // Use the base layout for all other pages
        return h(BaseLayout, null, slots)
      }
    },
  })

  return {
    extends: baseTheme,
    Layout: BlogAwareLayout,
    enhanceApp(ctx: EnhanceAppContext) {
      const { app } = ctx

      // Register global components
      // BlogIndex is the main component, registered under multiple names for convenience
      app.component('BlogIndex', BlogIndex)
      app.component('BlogPostList', BlogIndex)  // Legacy alias
      app.component('BlogHome', BlogIndex)      // Legacy alias
    },
  }
}
