---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Mocket"
  text: "MoonBit Web Framework"
  tagline: "A fast MoonBit HTTP and WebSocket framework with a small API surface and native-first performance."
  image:
    src: /logo.jpg
    alt: Mocket
  actions:
    - theme: brand
      text: Launch Mocket
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/oboard/mocket
features:
  - icon: 🚀
    title: Native-first speed
    details: Lean route handling for plaintext, JSON, echo, static assets, and WebSocket workloads.
  - icon: 🧩
    title: Small composable API
    details: Handlers, responders, body readers, middleware, cookies, CORS, and static files stay explicit.
  - icon: 🌙
    title: MoonBit ergonomics
    details: Built around typed routes, async handlers, and readable examples that map directly to MoonBit packages.
---

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A//mooncakes.io/assets/oboard/mocket/resource.json&query=%24.meta_info.version&label=mooncakes&color=yellow)](https://mooncakes.io/docs/oboard/mocket) ![visitors](https://visitor-badge.laobi.icu/badge?page_id=mocket-docs-0-6-0)

```moonbit
async fn main {
  let app = @mocket.new()
  app.get("/", _ => "Hello, Mocket!")
  app.listen(":4000")
}
```

<div class="mocket-section-heading">
<h2>Benchmark</h2>
<p>
The benchmark uses the equivalent route set from
<a href="https://github.com/oboard/mocket/tree/main/benchmarks">benchmarks</a>:
<code>GET /plaintext</code>, <code>GET /json</code>, and <code>GET /echo/:name</code>.
</p>
</div>

<div class="bench-chart" role="img" aria-label="Average requests per second by framework">
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="/logo.jpg" alt="" loading="lazy" />mocket</div><div class="bench-track"><div class="bench-bar" style="width:91.6%"></div></div><div class="bench-value">96,142.55</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/gin.svg" alt="" loading="lazy" />gin</div><div class="bench-track"><div class="bench-bar" style="width:83.0%"></div></div><div class="bench-value">87,200.78</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg" alt="" loading="lazy" />axum</div><div class="bench-track"><div class="bench-bar" style="width:82.3%"></div></div><div class="bench-value">86,371.40</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" alt="" loading="lazy" />springboot</div><div class="bench-track"><div class="bench-bar" style="width:75.9%"></div></div><div class="bench-value">79,657.07</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="" loading="lazy" />nodejs</div><div class="bench-track"><div class="bench-bar" style="width:74.0%"></div></div><div class="bench-value">77,732.00</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hono.svg" alt="" loading="lazy" />hono</div><div class="bench-track"><div class="bench-bar" style="width:66.2%"></div></div><div class="bench-value">69,488.25</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/denojs/denojs-original.svg" alt="" loading="lazy" />deno</div><div class="bench-track"><div class="bench-bar" style="width:57.9%"></div></div><div class="bench-value">60,803.74</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://unjs.io/assets/logos/nitro.svg" alt="" loading="lazy" />nitro</div><div class="bench-track"><div class="bench-bar" style="width:53.6%"></div></div><div class="bench-value">56,317.00</div></div>
<div class="bench-row"><div class="bench-target"><img class="bench-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg" alt="" loading="lazy" />bun</div><div class="bench-track"><div class="bench-bar" style="width:42.6%"></div></div><div class="bench-value">44,707.67</div></div>
</div>

| target | avg req/s | plaintext | json | echo | errors/timeouts |
| :--- | ---: | ---: | ---: | ---: | ---: |
| <span class="bench-table-target"><img src="/logo.jpg" alt="" />mocket</span> | 96,142.55 | 101,466.19 | 93,186.91 | 93,774.55 | 0/0 |
| <span class="bench-table-target"><img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/gin.svg" alt="" />gin</span> | 87,200.78 | 92,824.73 | 78,692.80 | 90,084.80 | 0/0 |
| <span class="bench-table-target"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg" alt="" />axum</span> | 86,371.40 | 82,056.00 | 97,370.19 | 79,688.00 | 0/0 |
| <span class="bench-table-target"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" alt="" />springboot</span> | 79,657.07 | 82,828.80 | 75,342.40 | 80,800.00 | 23,486/0 |
| <span class="bench-table-target"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="" />nodejs</span> | 77,732.00 | 79,110.40 | 80,928.00 | 73,157.61 | 0/0 |
| <span class="bench-table-target"><img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hono.svg" alt="" />hono</span> | 69,488.25 | 71,464.00 | 67,546.19 | 69,454.55 | 0/0 |
| <span class="bench-table-target"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/denojs/denojs-original.svg" alt="" />deno</span> | 60,803.74 | 61,145.60 | 54,776.00 | 66,489.61 | 0/0 |
| <span class="bench-table-target"><img src="https://unjs.io/assets/logos/nitro.svg" alt="" />nitro</span> | 56,317.00 | 57,168.00 | 56,522.19 | 55,260.80 | 0/0 |
| <span class="bench-table-target"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg" alt="" />bun</span> | 44,707.67 | 27,895.80 | 51,011.20 | 55,216.00 | 0/0 |
