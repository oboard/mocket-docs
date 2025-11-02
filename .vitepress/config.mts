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
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/1-core-types' },
      { text: 'Examples', link: '/examples/1-hello-world-example' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/guide/' },
          { text: 'Quick Start Guide', link: '/guide/1-quick-start-guide' },
          { text: 'Package Dependencies', link: '/guide/2-package-dependencies' }
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Routing System', link: '/core/1-routing-system' },
          { text: 'Static Routes', link: '/core/1.1-static-routes' },
          { text: 'Dynamic Routes and Parameters', link: '/core/1.2-dynamic-routes-and-parameters' },
          { text: 'Route Groups', link: '/core/1.3-route-groups' },
          { text: 'Middleware System', link: '/core/2-middleware-system' },
          { text: 'Request and Response Handling', link: '/core/3-request-and-response-handling' },
          { text: 'Response Types', link: '/core/3.1-response-types' },
          { text: 'Request Body Parsing', link: '/core/3.2-request-body-parsing' }
        ]
      },
      {
        text: 'Multi-Backend Architecture',
        items: [
          { text: 'JavaScript Backend', link: '/backends/1-javascript-backend' },
          { text: 'Asynchronous Operations', link: '/backends/1.1-asynchronous-operations' },
          { text: 'JavaScript FFI Layer', link: '/backends/1.2-javascript-ffi-layer' },
          { text: 'Native Backend', link: '/backends/2-native-backend' },
          { text: 'Mongoose Integration', link: '/backends/2.1-mongoose-integration' },
          { text: 'Native FFI Patterns', link: '/backends/2.2-native-ffi-patterns' },
          { text: 'WASM Backend', link: '/backends/3-wasm-backend' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Core Types', link: '/api/1-core-types' },
          { text: 'Route Registration API', link: '/api/2-route-registration-api' },
          { text: 'Error Types', link: '/api/3-error-types' }
        ]
      },
      {
        text: 'Advanced Features',
        items: [
          { text: 'Logging System', link: '/advanced/1-logging-system' },
          { text: 'Server Configuration', link: '/advanced/2-server-configuration' },
          { text: 'Header Manipulation', link: '/advanced/3-header-manipulation' }
        ]
      },
      {
        text: 'Development Guide',
        items: [
          { text: 'Project Structure', link: '/development/1-project-structure' },
          { text: 'Building and Testing', link: '/development/2-building-and-testing' },
          { text: 'Deployment', link: '/development/3-deployment' }
        ]
      },
      {
        text: 'Examples and Tutorials',
        items: [
          { text: 'Hello World Example', link: '/examples/1-hello-world-example' },
          { text: 'REST API Example', link: '/examples/2-rest-api-example' },
          { text: 'Middleware Example', link: '/examples/3-middleware-example' }
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
