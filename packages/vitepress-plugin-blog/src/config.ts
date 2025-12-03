/**
 * Unified configuration helpers for VitePress Blog Plugin.
 * 
 * This module provides a simplified API for configuring the blog plugin
 * with automatic path detection, eliminating the need for manual path setup.
 * 
 * @module config
 * 
 * @example
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress'
 * import { defineBlogConfig, createBlogPlugin, createSidebar } from 'vitepress-plugin-blog/config'
 * 
 * // Define blog configuration once
 * const blog = defineBlogConfig({
 *   postsDir: 'blog/posts',
 *   recentPostsCount: 5
 * })
 * 
 * export default defineConfig({
 *   vite: {
 *     plugins: [blog.plugin]
 *   },
 *   themeConfig: {
 *     sidebar: {
 *       '/blog/': blog.sidebar
 *     }
 *   }
 * })
 * ```
 */

import fs from 'fs'
import path from 'path'
import { blogPlugin, type BlogPluginOptions } from './plugin'
import { generateBlogSidebarFromFiles, type SidebarItem, type BlogSidebarOptions } from './sidebar'

/**
 * Converts a file URL to a path string.
 * Simple implementation to avoid importing from 'url' module.
 */
function fileUrlToPath(fileUrl: string): string {
  if (!fileUrl.startsWith('file://')) {
    return fileUrl
  }
  // Remove file:// prefix and decode URI components
  let filePath = decodeURIComponent(fileUrl.slice(7))
  // On Windows, remove leading slash before drive letter (e.g., /C:/... -> C:/...)
  if (/^\/[A-Za-z]:/.test(filePath)) {
    filePath = filePath.slice(1)
  }
  return filePath
}

/**
 * Combined configuration options for the blog.
 */
export interface BlogConfig extends BlogPluginOptions {
  /**
   * Absolute path to the docs directory.
   * If not provided, it will be auto-detected from the calling file location.
   */
  docsDir?: string
}

/**
 * Result of defineBlogConfig with pre-configured plugin and sidebar.
 */
export interface BlogConfigResult {
  /** 
   * The Vite plugin for blog functionality.
   * 
   * Uses a structural type compatible with Vite's PluginOption to avoid 
   * version conflicts between different Vite installations (e.g., when 
   * VitePress bundles its own Vite version).
   */
  plugin: { name: string; [key: string]: unknown }
  /** The sidebar configuration for the blog section */
  sidebar: SidebarItem[]
  /** The resolved docs directory path */
  docsDir: string
  /** The resolved posts directory path */
  postsDir: string
}

/**
 * Detects the docs directory from the calling file location.
 * 
 * This works by:
 * 1. Looking at the Error stack to find the calling file
 * 2. Assuming the config file is at .vitepress/config.mts
 * 3. Resolving the parent directory as the docs directory
 */
function detectDocsDir(): string {
  // Try to detect from Error stack trace
  const originalPrepareStackTrace = Error.prepareStackTrace
  let callerFile: string | undefined
  
  try {
    Error.prepareStackTrace = (_, stack) => stack
    const err = new Error()
    const stack = err.stack as unknown as NodeJS.CallSite[]
    
    // Find the first file that's not in this module or node_modules
    for (const site of stack) {
      const fileName = site.getFileName()
      if (fileName && 
          !fileName.includes('node_modules') && 
          !fileName.includes('vitepress-plugin-blog') &&
          (fileName.endsWith('.ts') || fileName.endsWith('.mts') || fileName.endsWith('.js') || fileName.endsWith('.mjs'))) {
        callerFile = fileName
        break
      }
    }
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace
  }
  
  if (callerFile) {
    // Handle both file URLs and regular paths
    const callerPath = callerFile.startsWith('file://') 
      ? fileUrlToPath(callerFile) 
      : callerFile
    
    // Assume config is at .vitepress/config.mts, so docs is parent of .vitepress
    const configDir = path.dirname(callerPath)
    const parentDir = path.dirname(configDir)
    
    // Verify this looks like a VitePress docs directory
    if (fs.existsSync(path.join(configDir, 'config.mts')) || 
        fs.existsSync(path.join(configDir, 'config.ts')) ||
        fs.existsSync(path.join(configDir, 'config.js')) ||
        path.basename(configDir) === '.vitepress') {
      return parentDir
    }
    
    // Fall back to the config directory's parent
    return parentDir
  }
  
  // Fallback: use process.cwd()
  const cwd = process.cwd()
  
  // Check if cwd has a .vitepress directory
  if (fs.existsSync(path.join(cwd, '.vitepress'))) {
    return cwd
  }
  
  // Check if we're inside .vitepress
  if (path.basename(cwd) === '.vitepress') {
    return path.dirname(cwd)
  }
  
  return cwd
}

/**
 * Defines a complete blog configuration with auto-detected paths.
 * 
 * This is the recommended way to configure the blog plugin as it:
 * - Automatically detects your docs directory
 * - Creates both the Vite plugin and sidebar config
 * - Ensures consistent options between plugin and sidebar
 * 
 * @param options - Blog configuration options
 * @returns An object with the configured plugin and sidebar
 * 
 * @example
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress'
 * import { defineBlogConfig } from 'vitepress-plugin-blog/config'
 * 
 * const blog = defineBlogConfig()
 * 
 * export default defineConfig({
 *   vite: {
 *     plugins: [blog.plugin]
 *   },
 *   themeConfig: {
 *     sidebar: {
 *       '/blog/': blog.sidebar
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * With custom options:
 * ```ts
 * const blog = defineBlogConfig({
 *   postsDir: 'articles',
 *   recentPostsCount: 10,
 *   wordsPerMinute: 200
 * })
 * ```
 */
export function defineBlogConfig(options: BlogConfig = {}): BlogConfigResult {
  const docsDir = options.docsDir ?? detectDocsDir()
  const postsDir = options.postsDir ?? 'blog/posts'
  
  // Create sidebar options from combined config
  const sidebarOptions: BlogSidebarOptions = {
    basePath: '/blog/',
    recentPostsCount: options.sidebar?.recentPostsCount ?? 5,
    allPostsLabel: options.sidebar?.allPostsLabel ?? 'All posts',
    recentPostsLabel: options.sidebar?.recentPostsLabel ?? 'Recent posts',
    recentPostsCollapsed: options.sidebar?.recentPostsCollapsed ?? false,
  }
  
  // Create the plugin with sidebar options for HMR
  // Cast to a structural type compatible with Vite's PluginOption to avoid 
  // version conflicts between the plugin's Vite types and VitePress's bundled Vite types
  const plugin = blogPlugin({
    postsDir,
    wordsPerMinute: options.wordsPerMinute ?? 220,
    sidebar: sidebarOptions,
  }) as { name: string; [key: string]: unknown }
  
  // Generate the sidebar synchronously
  const sidebar = generateBlogSidebarFromFiles(docsDir, {
    ...sidebarOptions,
    postsPattern: `${postsDir}/**/*.md`,
  })
  
  return {
    plugin,
    sidebar,
    docsDir,
    postsDir,
  }
}

/**
 * Creates a blog Vite plugin with auto-detected docs directory.
 * 
 * This is a convenience wrapper around `blogPlugin` that automatically
 * detects the docs directory.
 * 
 * @param options - Plugin configuration options
 * @returns A configured Vite plugin
 * 
 * @example
 * ```ts
 * import { defineConfig } from 'vitepress'
 * import { createBlogPlugin } from 'vitepress-plugin-blog/config'
 * 
 * export default defineConfig({
 *   vite: {
 *     plugins: [createBlogPlugin()]
 *   }
 * })
 * ```
 */
export function createBlogPlugin(options: BlogPluginOptions = {}): ReturnType<typeof blogPlugin> {
  return blogPlugin(options)
}

/**
 * Creates a blog sidebar with auto-detected docs directory.
 * 
 * This is a convenience wrapper around `generateBlogSidebarFromFiles` that
 * automatically detects the docs directory.
 * 
 * @param options - Sidebar configuration options
 * @returns An array of sidebar items
 * 
 * @example
 * ```ts
 * import { defineConfig } from 'vitepress'
 * import { createSidebar } from 'vitepress-plugin-blog/config'
 * 
 * export default defineConfig({
 *   themeConfig: {
 *     sidebar: {
 *       '/blog/': createSidebar()
 *     }
 *   }
 * })
 * ```
 */
export function createSidebar(options: BlogSidebarOptions & { postsPattern?: string } = {}): SidebarItem[] {
  const docsDir = detectDocsDir()
  return generateBlogSidebarFromFiles(docsDir, options)
}

// Re-export types for convenience
export type { BlogPluginOptions } from './plugin'
export type { SidebarItem, BlogSidebarOptions } from './sidebar'
