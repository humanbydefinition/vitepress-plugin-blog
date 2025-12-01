/**
 * Composable for managing blog sidebar with HMR support.
 * 
 * This composable provides reactive access to the blog sidebar data
 * and handles HMR updates from the Vite plugin by patching the DOM.
 * 
 * @module composables/useBlogSidebar
 */

import { ref, onMounted, nextTick } from 'vue'
import type { Ref } from 'vue'

/**
 * Represents a VitePress sidebar item.
 */
export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

/**
 * Return type for the useBlogSidebar composable.
 */
export interface UseBlogSidebarReturn {
  /** Reactive sidebar items */
  sidebar: Ref<SidebarItem[]>
  /** Whether the sidebar has been initialized */
  initialized: Ref<boolean>
}

/**
 * Global reactive state for blog sidebar that persists across component instances.
 * This ensures HMR updates are reflected globally.
 */
const globalSidebarRef = ref<SidebarItem[]>([])
const initializedRef = ref(false)
let hmrListenerRegistered = false

/**
 * Loads sidebar data from the injected script tag in the HTML.
 * This is populated by blogPlugin() at build time.
 */
function loadSidebarFromDOM(): SidebarItem[] {
  if (typeof document === 'undefined') return []
  
  const scriptEl = document.getElementById('vitepress-blog-sidebar')
  if (!scriptEl?.textContent) return []
  
  try {
    const sidebar = JSON.parse(scriptEl.textContent)
    return Array.isArray(sidebar) ? sidebar : []
  } catch {
    return []
  }
}

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
    console.log('[vitepress-plugin-blog] No recent posts section found in sidebar data')
    return
  }
  
  // Find all sidebar groups in VitePress
  // VitePress uses .VPSidebarItem for sidebar sections
  const sidebarGroups = document.querySelectorAll('.VPSidebarItem.level-0')
  
  for (const group of sidebarGroups) {
    // Find the title element - it's inside .item > .text or similar
    const titleEl = group.querySelector(':scope > .item .text')
    const titleText = titleEl?.textContent?.trim().toLowerCase() || ''
    
    // Check if this is the "Recent posts" section
    if (titleText.includes('recent')) {
      console.log('[vitepress-plugin-blog] Found Recent posts section, updating...')
      
      // Find all the link items within this group
      // They are nested .VPSidebarItem elements
      const linkItems = group.querySelectorAll(':scope > .items > .VPSidebarItem')
      
      recentSection.items.forEach((item, index) => {
        const linkEl = linkItems[index]
        if (linkEl) {
          // Update the text
          const textEl = linkEl.querySelector('.text')
          if (textEl && textEl.textContent !== item.text) {
            console.log(`[vitepress-plugin-blog] Updating: "${textEl.textContent}" -> "${item.text}"`)
            textEl.textContent = item.text
          }
          
          // Update the href
          const anchorEl = linkEl.querySelector('a')
          if (anchorEl && item.link) {
            const currentHref = anchorEl.getAttribute('href') || ''
            // VitePress adds base path, so we need to handle that
            if (!currentHref.endsWith(item.link) && !currentHref.endsWith(item.link + '.html')) {
              anchorEl.setAttribute('href', item.link)
            }
          }
        }
      })
      
      console.log('[vitepress-plugin-blog] Sidebar DOM patched successfully')
      break
    }
  }
}

/**
 * Sets up the HMR listener for sidebar updates.
 */
function setupSidebarHmrListener(): void {
  if (hmrListenerRegistered) return
  hmrListenerRegistered = true

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaObj = import.meta as any
    const hot = metaObj.hot
    if (hot && typeof hot.on === 'function') {
      hot.on('blog-sidebar-update', async (newSidebar: SidebarItem[]) => {
        console.log('[vitepress-plugin-blog] Sidebar HMR update received:', 
          Array.isArray(newSidebar) ? newSidebar.length : 0, 'sections')
        
        if (Array.isArray(newSidebar)) {
          // Update our reactive state
          globalSidebarRef.value = [...newSidebar]
          
          // Wait for any pending Vue updates, then patch DOM
          await nextTick()
          // Small delay to ensure VitePress has finished any updates
          setTimeout(() => {
            patchVitePressSidebar(newSidebar)
          }, 50)
        }
      })
      console.log('[vitepress-plugin-blog] Sidebar HMR listener registered')
    }
  } catch {
    // HMR not available (production build or SSR)
  }
}

/**
 * Composable for managing the blog sidebar with HMR support.
 * 
 * This composable:
 * - Loads sidebar data from the injected script on mount
 * - Sets up HMR listener for live updates during development
 * - Patches the VitePress sidebar DOM when blog posts change
 * 
 * **Usage:** Call this composable in your theme's Layout component
 * to enable HMR for the blog sidebar.
 * 
 * @returns An object with reactive sidebar data
 * 
 * @example
 * ```ts
 * // In your theme's index.ts or Layout component
 * import { useBlogSidebar } from 'vitepress-plugin-blog'
 * 
 * // Call once to initialize HMR support
 * useBlogSidebar()
 * ```
 */
export function useBlogSidebar(): UseBlogSidebarReturn {
  onMounted(() => {
    // Initialize sidebar from DOM on first mount
    if (!initializedRef.value) {
      const loadedSidebar = loadSidebarFromDOM()
      if (loadedSidebar.length > 0) {
        globalSidebarRef.value = loadedSidebar
        initializedRef.value = true
      }
    }
    
    // Set up HMR listener
    setupSidebarHmrListener()
  })

  return {
    sidebar: globalSidebarRef,
    initialized: initializedRef,
  }
}
