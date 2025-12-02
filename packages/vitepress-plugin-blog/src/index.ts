/**
 * vitepress-plugin-blog
 *
 * A VitePress plugin for adding blog functionality with automatic post discovery,
 * layouts, and components.
 *
 * @packageDocumentation
 */

import type { Theme, EnhanceAppContext } from 'vitepress'
import { defineComponent, h, provide, ref, onMounted, nextTick } from 'vue'
import { useData } from 'vitepress'

// Internal imports
import BlogPostLayout from './layouts/BlogPostLayout.vue'
import BlogIndex from './components/BlogIndex.vue'
import BlogCard from './components/BlogCard.vue'
import BlogFilters from './components/BlogFilters.vue'
import BlogPagination from './components/BlogPagination.vue'
import { blogPostsKey } from './injectionKeys'
import type { BlogPostEntry } from './types'
import type { SidebarItem } from './sidebar'

// ============================================================================
// Virtual Module Import
// ============================================================================

/**
 * Import blog posts from virtual module provided by blogPlugin().
 * This is the primary data source that works in both dev server and production build.
 * 
 * The virtual module is resolved at build time by Vite/Rollup, ensuring
 * the data is available during SSR/SSG rendering.
 */
import { blogPosts as virtualBlogPosts } from 'virtual:blog-posts'

// ============================================================================
// Shared State for HMR
// ============================================================================

/**
 * Shared reactive state for blog posts that persists across component instances.
 * This ensures HMR updates are reflected globally, not just in a single component instance.
 * 
 * Initialized with posts from the virtual module, which is populated at build time
 * by the blogPlugin() Vite plugin.
 */
const globalPostsRef = ref<BlogPostEntry[]>(virtualBlogPosts || [])

/**
 * Shared reactive state for blog sidebar.
 */
const globalSidebarRef = ref<SidebarItem[]>([])

/**
 * Flag to track if HMR listener has been registered.
 * Prevents duplicate listener registrations.
 */
let hmrListenerRegistered = false

/**
 * Updates the VitePress sidebar DOM to reflect new sidebar data.
 * This patches the existing sidebar without a full page reload.
 */
function patchVitePressSidebar(sidebar: SidebarItem[]): void {
  if (typeof document === 'undefined') return
  
  // Find the "Recent posts" section in our data
  const recentSection = sidebar.find(s => 
    s.text.toLowerCase().includes('recent')
  )
  
  if (!recentSection?.items) {
    return
  }
  
  // Find all sidebar groups in VitePress
  const sidebarGroups = document.querySelectorAll('.VPSidebarItem.level-0')
  
  for (const group of sidebarGroups) {
    // Find the title element
    const titleEl = group.querySelector(':scope > .item .text')
    const titleText = titleEl?.textContent?.trim().toLowerCase() || ''
    
    // Check if this is the "Recent posts" section
    if (titleText.includes('recent')) {
      // Find all the link items within this group
      const linkItems = group.querySelectorAll(':scope > .items > .VPSidebarItem')
      
      recentSection.items.forEach((item, index) => {
        const linkEl = linkItems[index]
        if (linkEl) {
          // Update the text
          const textEl = linkEl.querySelector('.text')
          if (textEl && textEl.textContent !== item.text) {
            console.log(`[vitepress-plugin-blog] Sidebar: "${textEl.textContent}" -> "${item.text}"`)
            textEl.textContent = item.text
          }
          
          // Update the href
          const anchorEl = linkEl.querySelector('a')
          if (anchorEl && item.link) {
            const currentHref = anchorEl.getAttribute('href') || ''
            if (!currentHref.endsWith(item.link) && !currentHref.endsWith(item.link + '.html')) {
              anchorEl.setAttribute('href', item.link)
            }
          }
        }
      })
      break
    }
  }
}

/**
 * Sets up the HMR listener for blog posts and sidebar updates.
 * Called during component mount to ensure it runs in browser context.
 */
function setupHmrListener(): void {
  if (hmrListenerRegistered) return
  hmrListenerRegistered = true

  // Access import.meta.hot dynamically to prevent tree-shaking
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaObj = import.meta as any
    const hot = metaObj.hot
    if (hot && typeof hot.on === 'function') {
      // Listen for blog posts updates
      hot.on('blog-posts-update', (newPosts: BlogPostEntry[]) => {
        console.log('[vitepress-plugin-blog] HMR update received:', Array.isArray(newPosts) ? newPosts.length : 0, 'posts')
        if (Array.isArray(newPosts)) {
          globalPostsRef.value = [...newPosts]
        }
      })
      
      // Listen for sidebar updates
      hot.on('blog-sidebar-update', async (newSidebar: SidebarItem[]) => {
        console.log('[vitepress-plugin-blog] Sidebar HMR update received')
        if (Array.isArray(newSidebar)) {
          globalSidebarRef.value = [...newSidebar]
          
          // Wait for Vue updates, then patch DOM
          await nextTick()
          setTimeout(() => {
            patchVitePressSidebar(newSidebar)
          }, 50)
        }
      })
      
      console.log('[vitepress-plugin-blog] HMR listeners registered (posts + sidebar)')
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
export { useBlogPosts, useBlogNavigation, useBlogSidebar } from './composables'
export type { UseBlogPostsReturn, UseBlogNavigationReturn, UseBlogSidebarReturn } from './composables'

// Utilities
export { formatDate, parseDate } from './utils/date'
export { isGitHubUsername, getGitHubAvatarUrl } from './utils/author'

// Injection Keys (for advanced usage)
export { blogPostsKey } from './injectionKeys'

// Sidebar utilities (prefer importing from 'vitepress-plugin-blog/sidebar')
export { generateBlogSidebar, generateBlogSidebarFromFiles } from './sidebar'
export type { SidebarItem, BlogSidebarOptions } from './sidebar'

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
 * @param baseTheme - The base VitePress theme to extend (required)
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
  baseTheme: Theme,
  options: BlogOptions = {}
): Theme {
  if (!baseTheme) {
    throw new Error('[vitepress-plugin-blog] baseTheme is required. Pass your VitePress theme (e.g., DefaultTheme) as the first argument.')
  }

  const blogFlagKey = options.blogFrontmatterKey ?? 'blogPost'
  const BaseLayout = baseTheme.Layout

  if (!BaseLayout) {
    throw new Error('[vitepress-plugin-blog] baseTheme.Layout is required. Make sure you pass a valid VitePress theme.')
  }

  // Initialize global posts with options.posts if provided (legacy support)
  // Note: Virtual module import is the primary source, this is only for backward compatibility
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

      // Register HMR listeners on mount (client-side only)
      // This ensures updates are reflected in the shared state during development
      onMounted(() => {
        setupHmrListener()
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
