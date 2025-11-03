---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Mocket"
  text: "MoonBit Web Framework"
  tagline: "A multi-target HTTP server framework for MoonBit that enables developers to write HTTP server applications that compile to multiple target platforms."
  image:
    src: /logo.svg
    alt: Mocket
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/oboard/mocket

features:
  - icon: 🎯
    title: Multi-Target Support
    details: Write once, run everywhere. Compile to JavaScript (Node.js), Native (C/Mongoose), and WASM backends with the same codebase.
  - icon: 🛡️
    title: Type Safety
    details: Comprehensive type system for requests, responses, and errors across FFI boundaries.
  - icon: 🔧
    title: Easy API
    details: Familiar routing patterns with get, post, middleware chains, and route groups for easy adoption.
  - icon: 📦
    title: Backend-Agnostic Core
    details: Application code interacts only with platform-independent types and APIs.
  - icon: 🚀
    title: Production Ready
    details: Built-in logging, error handling, and deployment-ready configurations.
---

## Quick Example

```moonbit
let app = @mocket.new(logger=@mocket.new_debug_logger())

app
  .use_middleware(event => println("Request: \{event.req.http_method} \{event.req.url}"))
  .get("/", _ => Text("Hello, Mocket!"))
  .get("/user/:id", event => {
    let id = event.params.get("id").unwrap_or("unknown")
    Json({ "user_id": id })
  })
  .group("/api", group => {
    group.get("/status", _ => Json({ "status": "ok" }))
  })
  .serve(port=4000)
```

## Why Mocket?

Mocket bridges the gap between MoonBit's powerful type system and modern web development needs. Whether you're building APIs, microservices, or full web applications, Mocket provides the tools you need with the performance and safety guarantees of MoonBit.

- **🎯 Multi-Platform**: One codebase, multiple deployment targets
- **🛡️ Type Safe**: Catch errors at compile time, not runtime
- **🔧 Developer Friendly**: Familiar patterns and excellent tooling
- **📦 Production Ready**: Built-in logging, middleware, and error handling
