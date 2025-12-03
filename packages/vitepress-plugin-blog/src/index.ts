/**
 * vitepress-plugin-blog
 *
 * A VitePress plugin for adding blog functionality with automatic post discovery,
 * layouts, and components.
 *
 * @packageDocumentation
 */

import type { Theme, EnhanceAppContext } from 'vitepress'
import { defineComponent, h, provide, ref, onMounted, nextTick, shallowRef, type Component } from 'vue'

// Only import types and SSR-safe modules at top level
import { blogPostsKey, baseLayoutKey, vitePressDataKey, withBaseKey } from './injectionKeys'
import type { BlogPostEntry } from './types'
import type { SidebarItem } from './sidebar'

// Lazy-loaded component references
// These are populated during enhanceApp, which runs after Vite's module loading
let BlogPostLayoutComponent: Component | null = null
let BlogLayoutWrapperComponent: Component | null = null
let BlogIndexComponent: Component | null = null
let BlogCardComponent: Component | null = null
let BlogFiltersComponent: Component | null = null
let BlogPaginationComponent: Component | null = null

/**
 * Dynamically imports all Vue components.
 * This defers the loading of components that import from 'vitepress'
 * until runtime, avoiding SSR import errors.
 */
async function loadComponents(): Promise<void> {
  const [
    BlogPostLayout,
    BlogLayoutWrapper,
    BlogIndex,
    BlogCard,
    BlogFilters,
    BlogPagination,
  ] = await Promise.all([
    import('./layouts/BlogPostLayout.vue'),
    import('./components/BlogLayoutWrapper.vue'),
    import('./components/BlogIndex.vue'),
    import('./components/BlogCard.vue'),
    import('./components/BlogFilters.vue'),
    import('./components/BlogPagination.vue'),
  ])
  
  BlogPostLayoutComponent = BlogPostLayout.default
  BlogLayoutWrapperComponent = BlogLayoutWrapper.default
  BlogIndexComponent = BlogIndex.default
  BlogCardComponent = BlogCard.default
  BlogFiltersComponent = BlogFilters.default
  BlogPaginationComponent = BlogPagination.default
}

// Cached VitePress module (populated lazily)
let vitepressModule: typeof import('vitepress') | null = null

/**
 * Lazily loads VitePress client utilities.
 * Called during enhanceApp which runs in a context where vitepress is available.
 */
async function loadVitePressUtils(): Promise<typeof import('vitepress') | null> {
  if (vitepressModule) return vitepressModule
  
  try {
    vitepressModule = await import('vitepress')
    return vitepressModule
  } catch {
    return null
  }
}

// ============================================================================
// Shared State for HMR
// ============================================================================

/**
 * Shared reactive state for blog posts that persists across component instances.
 * This ensures HMR updates are reflected globally, not just in a single component instance.
 * 
 * Initialized empty and populated dynamically when the theme is set up.
 * The virtual module import happens lazily to avoid SSR issues.
 */
const globalPostsRef = ref<BlogPostEntry[]>([])

/**
 * Shared reactive state for blog sidebar.
 */
const globalSidebarRef = ref<SidebarItem[]>([])

/**
 * Flag to track if posts have been loaded from the virtual module.
 */
let postsLoaded = false

/**
 * Loads blog posts from the virtual module.
 * This is called lazily during enhanceApp to avoid SSR issues with the virtual: protocol.
 */
async function loadBlogPosts(): Promise<void> {
  if (postsLoaded) return
  postsLoaded = true
  
  try {
    // Dynamic import to avoid top-level virtual module resolution during SSR
    const { blogPosts } = await import('virtual:blog-posts')
    if (Array.isArray(blogPosts)) {
      globalPostsRef.value = blogPosts
    }
  } catch (e) {
    // Virtual module not available (blogPlugin not configured or SSR edge case)
    console.warn('[vitepress-plugin-blog] Could not load blog posts from virtual module. Make sure blogPlugin() is configured in your Vite config.')
  }
}

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

// Composable types (can be exported statically as they're just types)
export type { UseBlogPostsReturn, UseBlogNavigationReturn, UseBlogSidebarReturn } from './composables'

// SSR-safe composables (don't import from vitepress)
export { useBlogPosts } from './composables/useBlogPosts'
export { useBlogSidebar } from './composables/useBlogSidebar'

// useBlogNavigation imports from vitepress, so we provide a lazy getter
// Users can also import it directly: import { useBlogNavigation } from 'vitepress-plugin-blog/composables'
export const useBlogNavigation = async () => {
  const mod = await import('./composables/useBlogNavigation')
  return mod.useBlogNavigation
}

// Utilities (SSR-safe)
export { formatDate, parseDate } from './utils/date'
export { isGitHubUsername, getGitHubAvatarUrl } from './utils/author'

// Injection Keys (for advanced usage)
export { blogPostsKey, baseLayoutKey, vitePressDataKey, withBaseKey } from './injectionKeys'
export type { VitePressPageData, WithBaseFunction } from './injectionKeys'

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
  
  // Reactive ref for withBase function (populated in enhanceApp)
  const withBaseFnRef = shallowRef<typeof import('vitepress')['withBase'] | null>(null)
  
  // Reactive ref for useData function (populated in enhanceApp)
  // We store the function itself, not the result, since useData must be called in component setup
  const useDataFnRef = shallowRef<typeof import('vitepress')['useData'] | null>(null)
  
  // Reactive ref for the layout wrapper component (loaded lazily)
  const layoutWrapperRef = shallowRef<Component | null>(null)

  /**
   * Layout component that switches between blog and default layouts
   * based on frontmatter.
   */
  const BlogAwareLayout = defineComponent({
    name: 'BlogAwareLayout',
    setup(_, { slots }) {
      // Call useData here in component setup context (where it's valid)
      // This creates the reactive VitePress page data
      const vitePressData = useDataFnRef.value?.() ?? null
      
      // Register HMR listeners on mount (client-side only)
      // This ensures updates are reflected in the shared state during development
      onMounted(() => {
        setupHmrListener()
      })

      // Provide the global posts ref to all child components
      // Using the shared ref ensures HMR updates propagate correctly
      provide(blogPostsKey, globalPostsRef)

      // Provide the base layout to child components (e.g., BlogPostLayout)
      // This avoids the need to import DefaultTheme directly in components
      provide(baseLayoutKey, BaseLayout)
      
      // Provide VitePress utilities to child components
      // vitePressData is the result of calling useData() in this setup context
      provide(vitePressDataKey, shallowRef(vitePressData))
      provide(withBaseKey, withBaseFnRef)
      
      return () => {
        // Use the lazily loaded BlogLayoutWrapper
        if (layoutWrapperRef.value) {
          return h(layoutWrapperRef.value, { blogFlagKey }, slots)
        }
        // Fallback to base layout while component is loading
        return h(BaseLayout, null, slots)
      }
    },
  })

  return {
    extends: baseTheme,
    Layout: BlogAwareLayout,
    async enhanceApp(ctx: EnhanceAppContext) {
      const { app } = ctx

      // Load VitePress utilities dynamically to avoid SSR import issues
      const vp = await loadVitePressUtils()
      if (vp) {
        // Store the useData function (not the result!) to be called in component setup
        useDataFnRef.value = vp.useData
        // Store withBase function directly
        withBaseFnRef.value = vp.withBase
      }

      // Load components dynamically to avoid SSR import issues
      await loadComponents()
      
      // Set the layout wrapper ref so the layout can use it
      layoutWrapperRef.value = BlogLayoutWrapperComponent

      // Load posts from virtual module (lazy to avoid SSR issues)
      await loadBlogPosts()

      // Register global components using the dynamically loaded references
      if (BlogIndexComponent) {
        app.component('BlogIndex', BlogIndexComponent)
        app.component('BlogPostList', BlogIndexComponent)  // Legacy alias
        app.component('BlogHome', BlogIndexComponent)      // Legacy alias
      }
    },
  }
}
