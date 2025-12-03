import { defineConfig } from 'vitepress'
import { defineBlogConfig } from 'vitepress-plugin-blog/config'

// Define blog configuration - paths are auto-detected!
const blog = defineBlogConfig({
  sidebar: {
    recentPostsCount: 5,
  }
})

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
    plugins: [blog.plugin],
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Blog', link: '/blog/' },
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
      '/blog/': blog.sidebar,
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
