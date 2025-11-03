import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: "Mocket - MoonBit Web Framework",
  description: "A multi-target HTTP server framework for MoonBit that enables developers to write HTTP server applications that compile to multiple target platforms.",

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Routing', link: '/guide/routing' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/oboard/mocket' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/oboard/mocket/edit/main/docs/:path'
    },

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright © 2025 oboard'
    }
  },

  // Mermaid configuration
  mermaid: {
    theme: 'default'
  },

  // Shiki configuration for syntax highlighting
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    languages: [
      import("./moonbit.tmLanguage.json") as any
    ]
  }
}))
