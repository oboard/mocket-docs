---
title: Getting Started (0.5.8)
---
# Mocket - Getting Started (0.5.8)
[![Version](https://img.shields.io/badge/docs-0.5.8-green)](../)

A web framework for MoonBit.

## Quick Start


```bash
moon add oboard/mocket
```

```moonbit
let app = @mocket.new()
app.get("/", _ => Text("Hello, Mocket!"))
app.group("/api", group => {
    group.get("/status", _ => Json({ "status": "ok" }))
  })
app.serve(port=4000)
```

---


Mocket supports both `js` and `native` backends.

### JavaScript Backend

Set the backend of MoonBit to `js` in `Visual Studio Code`

Command: `MoonBit: Select Backend` -> `js`

```bash
moon run src/example --target js
```

### Native Backend

Set the backend of MoonBit to `native` in `Visual Studio Code`

Command: `MoonBit: Select Backend` -> `native`

```bash
moon run src/example --target native
```

Then visit `http://localhost:4000`

