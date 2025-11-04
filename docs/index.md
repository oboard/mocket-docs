---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Mocket"
  text: "MoonBit Web Framework"
  tagline: "A multi-target HTTP server framework for MoonBit."
  image:
    src: /logo.jpg
    alt: Mocket
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/oboard/mocket

# features:
#   - icon: 🎯
#     title: Multi-Target Support
#     details: Write once, run everywhere. Compile to JavaScript (Node.js), Native (C) backends with the same codebase.
---
![Version](https://img.shields.io/badge/dynamic/json?url=https%3A//mooncakes.io/assets/oboard/mocket/resource.json&query=%24.meta_info.version&label=mooncakes&color=yellow) ![visitors](https://visitor-badge.laobi.icu/badge?page_id=mocket-docs-page)

```moonbit
let app = @mocket.new()
app.get("/", _ => Text("Hello, Mocket!"))
app.serve(port=4000)
```

## Why Mocket?

Mocket bridges the gap between MoonBit's powerful type system and modern web development needs. Whether you're building APIs, microservices, or full web applications, Mocket provides the tools you need with the performance and safety guarantees of MoonBit.
