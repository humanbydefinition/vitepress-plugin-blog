<script setup lang="ts">
/**
 * BlogSidebar component that provides HMR-aware sidebar for blog posts.
 * 
 * This component listens for HMR updates and reactively updates
 * the sidebar links when blog post titles change.
 * 
 * Uses injected VitePress utilities to avoid direct imports from 'vitepress'.
 */
import { ref, onMounted, computed, inject } from 'vue'
import { vitePressDataKey } from '../injectionKeys'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

interface Props {
  basePath?: string
  recentPostsCount?: number
  allPostsLabel?: string
  recentPostsLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '/blog/',
  recentPostsCount: 5,
  allPostsLabel: 'All posts',
  recentPostsLabel: 'Recent posts',
})

// Get VitePress data from injection
const vitePressDataRef = inject(vitePressDataKey)

// Reactive sidebar state
const sidebarItems = ref<SidebarItem[]>([])
const initialized = ref(false)

// Get current route path from page data
// vitePressDataRef is ShallowRef<VitePressPageData | null>
const currentPath = computed(() => {
  const data = vitePressDataRef?.value
  if (!data) return '/'
  const pageData = data.page?.value
  if (!pageData?.relativePath) return '/'
  // Convert relative path to URL format
  return '/' + pageData.relativePath.replace(/\.md$/, '').replace(/index$/, '')
})

/**
 * Loads sidebar data from the injected script tag.
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
 * Sets up HMR listener for sidebar updates.
 */
function setupHmrListener(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaObj = import.meta as any
    const hot = metaObj.hot
    if (hot && typeof hot.on === 'function') {
      hot.on('blog-sidebar-update', (newSidebar: SidebarItem[]) => {
        console.log('[BlogSidebar] HMR update received')
        if (Array.isArray(newSidebar)) {
          sidebarItems.value = [...newSidebar]
        }
      })
    }
  } catch {
    // HMR not available
  }
}

// Get the "Recent posts" section
const recentPostsSection = computed(() => {
  return sidebarItems.value.find(s => 
    s.text.toLowerCase().includes('recent')
  )
})

// Get the main "Blog" section
const blogSection = computed(() => {
  return sidebarItems.value.find(s => 
    s.text.toLowerCase() === 'blog'
  )
})

// Check if a link is active
function isActive(link: string | undefined): boolean {
  if (!link) return false
  // Normalize paths for comparison
  const normalizedLink = link.replace(/\.html$/, '').replace(/\/$/, '') || '/'
  const normalizedCurrent = currentPath.value.replace(/\.html$/, '').replace(/\/$/, '') || '/'
  return normalizedLink === normalizedCurrent
}

// Get full href with base path
function getHref(link: string | undefined): string {
  if (!link) return '#'
  // For now, just return the link as-is
  // withBase would be applied if available via injection
  return link
}

onMounted(() => {
  // Load initial sidebar data
  const loaded = loadSidebarFromDOM()
  if (loaded.length > 0) {
    sidebarItems.value = loaded
    initialized.value = true
  }
  
  // Setup HMR
  setupHmrListener()
})
</script>
</script>

<template>
  <aside v-if="initialized" class="blog-sidebar">
    <!-- Blog section -->
    <div v-if="blogSection" class="sidebar-group">
      <p class="sidebar-group-title">{{ blogSection.text }}</p>
      <ul class="sidebar-links">
        <li 
          v-for="item in blogSection.items" 
          :key="item.link || item.text"
          class="sidebar-link"
          :class="{ active: isActive(item.link) }"
        >
          <a :href="getHref(item.link)">{{ item.text }}</a>
        </li>
      </ul>
    </div>
    
    <!-- Recent posts section -->
    <div v-if="recentPostsSection" class="sidebar-group">
      <p class="sidebar-group-title">{{ recentPostsSection.text }}</p>
      <ul class="sidebar-links">
        <li 
          v-for="item in recentPostsSection.items" 
          :key="item.link || item.text"
          class="sidebar-link"
          :class="{ active: isActive(item.link) }"
        >
          <a :href="getHref(item.link)">{{ item.text }}</a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.blog-sidebar {
  padding: 16px 0;
}

.sidebar-group {
  margin-bottom: 16px;
}

.sidebar-group-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  padding: 0 12px;
}

.sidebar-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-link {
  margin: 0;
}

.sidebar-link a {
  display: block;
  padding: 6px 12px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.sidebar-link a:hover {
  color: var(--vp-c-brand-1);
}

.sidebar-link.active a {
  color: var(--vp-c-brand-1);
  border-left-color: var(--vp-c-brand-1);
  font-weight: 500;
}
</style>
