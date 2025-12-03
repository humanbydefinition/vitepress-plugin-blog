import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/data/**'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        config: resolve(__dirname, 'src/config.ts'),
        sidebar: resolve(__dirname, 'src/sidebar.ts'),
        plugin: resolve(__dirname, 'src/plugin.ts'),
      },
      name: 'VitepressPluginBlog',
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'vue', 
        'vitepress', 
        'vitepress/theme',
        'gray-matter',
        'fs',
        'path',
        'url',
        /\.data\.ts$/,  // Externalize data loaders
        /^virtual:/,    // Externalize virtual modules
      ],
      output: {
        globals: {
          vue: 'Vue',
          vitepress: 'VitePress',
          'vitepress/theme': 'VitePressTheme',
        },
        // Preserve module structure - this keeps Vue components as separate chunks
        // that are only loaded when needed (in browser context)
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    copyPublicDir: false,
  },
})
