import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { generateBlogSidebarFromFiles } from 'vitepress-plugin-blog/sidebar'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pluginPath = resolve(__dirname, '../../packages/vitepress-plugin-blog/dist')
const docsDir = resolve(__dirname, '..')

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vitepress-plugin-blog/',
  title: "vitepress-plugin-blog",
  description: "Add blog functionality to your VitePress documentation",

  head: [
    [
      'script',
      {
        defer: '',
        src: 'https://analytics.textmode.art/script.js',
        'data-website-id': '57d79ecc-9136-4091-94f6-2e8cea7161ea'
      }
    ]
  ],

  vite: {
    resolve: {
      alias: [
        {
          find: /^vitepress-plugin-blog\/style\.css$/,
          replacement: resolve(pluginPath, 'style.css'),
        },
        {
          find: /^vitepress-plugin-blog\/sidebar$/,
          replacement: resolve(pluginPath, 'sidebar.js'),
        },
        {
          find: /^vitepress-plugin-blog$/,
          replacement: resolve(pluginPath, 'index.js'),
        },
      ],
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/humanbydefinition/vitepress-plugin-blog' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
          ]
        }
      ],
      '/blog/': generateBlogSidebarFromFiles(docsDir, {
        recentPostsCount: 5,
      }),
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/humanbydefinition/vitepress-plugin-blog' }
    ],

    footer: {
      message: '<a href="/vitepress-plugin-blog/legal/imprint">Imprint</a> | <a href="/vitepress-plugin-blog/legal/data-protection-policy">Data Protection Policy</a>',
      copyright: 'Copyright © 2025 humanbydefinition. Released under the MIT License.'
    }
  }
})
