import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    title: "Mocket - MoonBit Web Framework",
    description: "A multi-target HTTP server framework for MoonBit.",

    head: [["link", { rel: "icon", href: "/logo.jpg" }]],
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "Guide", link: "/guide/getting-started" },
        {
          text: "Version",
          items: [
            { text: "0.6.0 (latest)", link: "/" },
            { text: "0.5.8", link: "/0.5.8/" },
          ],
        },
      ],

      sidebar: {
        "/guide/": [
          { text: "🚀 Getting Started", link: "/guide/getting-started" },
          { text: "🚦 Routing", link: "/guide/routing" },
          { text: "📡 Responder", link: "/guide/responder" },
          { text: "📝 Body Reader", link: "/guide/body-reader" },
          { text: "🧩 Middleware", link: "/guide/middleware" },
          { text: "🍪 Cookie", link: "/guide/cookie" },
          { text: "🛡️ CORS", link: "/guide/cors" },
          { text: "⚡ WebSocket", link: "/guide/websocket" },
        ],
        "/0.5.8/guide/": [
          { text: "🚀 Getting Started", link: "/0.5.8/guide/getting-started" },
          { text: "🚦 Routing", link: "/0.5.8/guide/routing" },
          { text: "🧩 Middleware", link: "/0.5.8/guide/middleware" },
          { text: "🍪 Cookie", link: "/0.5.8/guide/cookie" },
          { text: "🛡️ CORS", link: "/0.5.8/guide/cors" },
          { text: "⚡ WebSocket", link: "/0.5.8/guide/websocket" },
        ],
      },

      socialLinks: [
        { icon: "github", link: "https://github.com/oboard/mocket" },
        {
          icon: "qq",
          link: "https://qm.qq.com/q/VtXeEDJcAg",
          ariaLabel: "QQ群 949886784",
        },
      ],

      search: {
        provider: "local",
      },

      editLink: {
        pattern: "https://github.com/oboard/mocket/edit/main/docs/:path",
      },

      footer: {
        message: "Released under the Apache 2.0 License.",
        copyright: "Copyright © 2025 oboard",
      },
    },

    // Mermaid configuration
    mermaid: {
      theme: "default",
    },

    // Shiki configuration for syntax highlighting
    markdown: {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      languages: [import("./moonbit.tmLanguage.json") as any],
    },
  })
);
