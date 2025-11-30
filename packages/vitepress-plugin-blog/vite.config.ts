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
        sidebar: resolve(__dirname, 'src/sidebar.ts'),
      },
      name: 'VitepressPluginBlog',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'vue', 
        'vitepress', 
        'vitepress/theme',
        'gray-matter',
        'fs',
        'path',
        /\.data\.ts$/,  // Externalize data loaders
      ],
      output: {
        globals: {
          vue: 'Vue',
          vitepress: 'VitePress',
          'vitepress/theme': 'VitePressTheme',
        },
      },
    },
    sourcemap: true,
    copyPublicDir: false,
  },
})
