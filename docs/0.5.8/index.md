---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Mocket"
  text: "MoonBit Web Framework"
  tagline: "Documentation for Mocket 0.5.8"
  image:
    src: /logo.jpg
    alt: Mocket
  actions:
    - theme: brand
      text: Get Started (0.5.8)
      link: /0.5.8/guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/oboard/mocket
---
![Version](https://img.shields.io/badge/docs-0.5.8-green) ![visitors](https://visitor-badge.laobi.icu/badge?page_id=mocket-docs-0-5-8)

```moonbit
let app = @mocket.new()
app.get("/", _ => Text("Hello, Mocket 0.5.8!"))
app.serve(port=4000)
```

## About 0.5.8

This is the stable 0.5.8 documentation snapshot.

