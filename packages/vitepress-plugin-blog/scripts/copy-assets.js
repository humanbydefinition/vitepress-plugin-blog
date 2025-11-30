import { mkdirSync, copyFileSync } from 'fs'

/**
 * Post-build script to copy assets that Vite's library mode doesn't handle:
 * 
 * 1. CSS - Exported separately so users can control import order
 * 2. Data loader - VitePress processes .data.ts files at runtime, 
 *    so it must remain as source (not bundled)
 * 3. Types - Needed by the data loader at runtime
 */

// Ensure dist directories exist
mkdirSync('dist/data', { recursive: true })

// Copy CSS file to dist
copyFileSync('src/styles/blog.css', 'dist/style.css')
console.log('✓ Copied style.css to dist/')

// Copy data loader to dist (VitePress will process this at runtime)
copyFileSync('src/data/blogPosts.data.ts', 'dist/data/blogPosts.data.ts')
console.log('✓ Copied data loader to dist/')

// Copy types for the data loader
copyFileSync('src/types.ts', 'dist/types.ts')
console.log('✓ Copied types.ts to dist/')
