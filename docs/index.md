---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Mocket"
  text: "MoonBit Web Framework"
  tagline: "Documentation for Mocket"
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
---

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A//mooncakes.io/assets/oboard/mocket/resource.json&query=%24.meta_info.version&label=mooncakes&color=yellow)](https://mooncakes.io/docs/oboard/mocket) ![visitors](https://visitor-badge.laobi.icu/badge?page_id=mocket-docs-0-6-0)

```moonbit
let app = @mocket.new()
app.get("/", _ => "Hello, Mocket!")
app.serve(port=4000)
```