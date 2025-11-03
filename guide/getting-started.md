---
title: Overview
---

# Overview

This document provides a high-level introduction to Mocket, a multi-target HTTP server framework for MoonBit.

## Usage Example

A minimal Mocket application demonstrating the core API:

```moonbit
let app = @mocket.new()
app.get("/", _ => Text("Hello, Mocket!"))
app.group("/api", group => {
    group.get("/status", _ => Json({ "status": "ok" }))
  })
app.serve(port=4000)
```
