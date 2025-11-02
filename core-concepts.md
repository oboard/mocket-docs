---
title: Core Concepts
---

# Core Concepts

This document explains the fundamental concepts required to build applications with Mocket. It covers the core type system, routing fundamentals, middleware execution model, and route organization patterns. For detailed information on specific topics, see:
- Routing implementation details: [Routing System](#2.1)
- Middleware patterns and examples: [Middleware System](#2.2)
- Request body parsing and response construction: [Request and Response Handling](#2.3)

## Core Type System

Mocket's type system is built around four primary types that represent the HTTP request-response lifecycle:

### The Mocket Application Object

The `Mocket` struct `src/index.mbt:11-27` is the main application object that holds all routes, middleware, and configuration:

| Field | Type | Purpose |
|-------|------|---------|
| `base_path` | `String` | Prefix applied to all routes in the application |
| `mappings` | `Map[(String, String), async (HttpEvent) -> HttpBody noraise]` | Complete registry of all routes (method + path) |
| `static_routes` | `Map[String, Map[String, ...]]` | O(1) lookup cache for exact path matches |
| `dynamic_routes` | `Map[String, Array[...]]` | Registry of routes containing parameters or wildcards |
| `middlewares` | `Array[(String, async (HttpEvent) -> Unit noraise)]` | Ordered list of middleware functions |
| `logger` | `Logger` | Logging system for route registration and request handling |

The dual-storage strategy (`static_routes` and `dynamic_routes`) optimizes route lookup performance by separating exact matches from pattern-based matches.

### HTTP Request-Response Lifecycle Types

```mermaid
graph TB
    HttpEvent["HttpEvent"]
    HttpRequest["HttpRequest<br/>http_method: String<br/>url: String<br/>headers: Map<br/>body: HttpBody"]
    HttpResponse["HttpResponse<br/>status_code: Int<br/>headers: Map"]
    HttpBody["HttpBody enum"]
    Params["params: Map[String, String]"]
    
    HttpEvent -->|"contains"| HttpRequest
    HttpEvent -->|"contains"| HttpResponse
    HttpEvent -->|"contains"| Params
    HttpRequest -->|"has"| HttpBody
    
    Handler["Route Handler<br/>async (HttpEvent) -> HttpBody noraise"]
    Middleware["Middleware<br/>async (HttpEvent) -> Unit noraise"]
    
    Handler -->|"receives"| HttpEvent
    Handler -->|"returns"| HttpBody
    Middleware -->|"receives"| HttpEvent
    Middleware -->|"modifies"| HttpResponse
```

**HttpEvent** encapsulates the complete request context:
- `req`: The incoming `HttpRequest` `src/index.mbt:48-53`
- `res`: The outgoing `HttpResponse` `src/index.mbt:56-60`
- `params`: Extracted route parameters from dynamic path segments

**HttpRequest** `src/index.mbt:48-53` contains:
- `http_method`: HTTP verb (GET, POST, etc.)
- `url`: Request path
- `headers`: Request headers as key-value map
- `body`: Parsed request body as `HttpBody`

**HttpResponse** `src/index.mbt:56-60` contains:
- `status_code`: HTTP status code (mutable)
- `headers`: Response headers (mutable map)

**Sources:** `src/index.mbt:11-60`, `README.md:42-208`

### HttpBody Type Variants

The `HttpBody` enum `src/index.mbt:2-8` represents both request and response body content:

```mermaid
graph LR
    HttpBody["HttpBody enum"]
    Json["Json(Json)<br/>Structured JSON data"]
    Text["Text(StringView)<br/>Plain text content"]
    HTML["HTML(StringView)<br/>HTML markup"]
    Bytes["Bytes(BytesView)<br/>Raw binary data"]
    Empty["Empty<br/>No body content"]
    
    HttpBody --> Json
    HttpBody --> Text
    HttpBody --> HTML
    HttpBody --> Bytes
    HttpBody --> Empty
```

| Variant | Use Case | Content-Type |
|---------|----------|--------------|
| `Json(Json)` | API responses, structured data | `application/json` |
| `Text(StringView)` | Plain text responses | `text/plain` |
| `HTML(StringView)` | Web pages, HTML content | `text/html` |
| `Bytes(BytesView)` | Binary files, images | `application/octet-stream` |
| `Empty` | 204 No Content, HEAD responses | None |

**Sources:** `src/index.mbt:2-8`, `README.md:122-186`

## Routing Fundamentals

### Route Registration API

Mocket provides HTTP method-specific functions that delegate to a core `on` function `src/index.mbt:89-128`:

```mermaid
graph TD
    UserCode["Application Code"]
    
    Get["get(path, handler)"]
    Post["post(path, handler)"]
    Put["put(path, handler)"]
    Delete["delete(path, handler)"]
    Patch["patch(path, handler)"]
    Options["options(path, handler)"]
    Head["head(path, handler)"]
    Trace["trace(path, handler)"]
    Connect["connect(path, handler)"]
    All["all(path, handler)"]
    
    On["on(method, path, handler)<br/>Core registration function"]
    
    Mappings["mappings<br/>Map[(method, path), handler]"]
    StaticRoutes["static_routes<br/>O(1) lookup"]
    DynamicRoutes["dynamic_routes<br/>Pattern matching"]
    
    UserCode --> Get
    UserCode --> Post
    UserCode --> Put
    UserCode --> Delete
    UserCode --> Patch
    
    Get --> On
    Post --> On
    Put --> On
    Delete --> On
    Patch --> On
    Options --> On
    Head --> On
    Trace --> On
    Connect --> On
    All --> On
    
    On --> Mappings
    On --> StaticRoutes
    On --> DynamicRoutes
```

Each method function `src/index.mbt:131-218` follows this signature:
```moonbit
pub fn METHOD(
  self : Mocket,
  path : String,
  handler : async (HttpEvent) -> HttpBody noraise,
) -> Unit
```

**Sources:** `src/index.mbt:89-218`, `README.md:114-189`

### Static vs Dynamic Route Classification

When a route is registered via `on()`, it is classified as either static or dynamic based on path analysis `src/index.mbt:100-127`:

**Static Routes** - Exact path matches with no special characters:
- Path contains neither `:` parameter markers nor `*` wildcards
- Stored in `static_routes` map for O(1) lookup
- Example: `/api/users`, `/hello`, `/`

**Dynamic Routes** - Paths with parameters or wildcards:
- Path contains `:param` named parameters
- Path contains `*` (single segment) or `**` (multi-segment) wildcards
- Stored in `dynamic_routes` array, requires regex matching
- Example: `/hello/:name`, `/files/*`, `/api/**`

The `template_to_regex` function `src/index.mbt:64-86` converts dynamic path templates to regex patterns:

| Template Segment | Regex Pattern | Matches |
|-----------------|---------------|---------|
| `:param` | `([^/]+)` | Single path segment |
| `*` | `([^/]+)` | Single path segment (stored as `_` param) |
| `**` | `(.*)` | Multiple path segments (stored as `_` param) |
| literal | `literal` | Exact match |

**Sources:** `src/index.mbt:64-127`, `README.md:44-71`, `README.md:197-207`

## Request Processing Flow

The following diagram shows how a request flows through Mocket from registration to response:

```mermaid
sequenceDiagram
    participant App as "Application Code"
    participant Mocket as "Mocket Instance"
    participant Logger as "logger"
    participant Storage as "Route Storage"
    participant Router as "Route Lookup"
    participant MW as "Middleware Chain"
    participant Handler as "Route Handler"
    
    Note over App,Mocket: Registration Phase
    App->>Mocket: get("/hello/:name", handler)
    Mocket->>Logger: route_register("GET", "/hello/:name")
    Mocket->>Storage: Add to mappings
    
    alt Static Route
        Mocket->>Logger: route_static()
        Mocket->>Storage: Add to static_routes
    else Dynamic Route
        Mocket->>Logger: route_dynamic()
        Mocket->>Storage: Add to dynamic_routes
    end
    
    Note over Router,Handler: Request Phase
    Router->>Storage: find_route("GET", "/hello/world")
    
    alt Static Lookup
        Storage-->>Router: O(1) map lookup
    else Dynamic Lookup
        Storage->>Storage: template_to_regex()
        Storage->>Storage: Pattern match
        Storage->>Storage: Extract params
        Storage-->>Router: (handler, params)
    end
    
    Router->>Logger: route_found() or route_not_found()
    Router->>MW: Execute middleware chain
    
    loop Each middleware
        MW->>MW: async (HttpEvent) -> Unit noraise
    end
    
    MW->>Handler: async (HttpEvent) -> HttpBody noraise
    Handler-->>MW: HttpBody result
    MW-->>Router: HttpBody
```

**Sources:** `src/index.mbt:89-128`

## Middleware Execution Model

Middleware functions have the signature `async (HttpEvent) -> Unit noraise` `src/index.mbt:14` and can modify the `HttpEvent` before it reaches route handlers.

### Middleware Storage and Execution

```mermaid
graph TB
    Global["Global Middleware<br/>app.use_middleware(fn)"]
    Group["Group Middleware<br/>group.use_middleware(fn)"]
    
    Storage["middlewares: Array<br/>(String, async (HttpEvent) -> Unit noraise)"]
    
    Request["Incoming Request"]
    MW1["Middleware 1"]
    MW2["Middleware 2"]
    MW3["Middleware 3"]
    Handler["Route Handler"]
    Response["HttpBody Response"]
    
    Global --> Storage
    Group --> Storage
    
    Request --> MW1
    MW1 -->|"modifies event"| MW2
    MW2 -->|"modifies event"| MW3
    MW3 -->|"modifies event"| Handler
    Handler --> Response
    
    Storage -.->|"provides"| MW1
    Storage -.->|"provides"| MW2
    Storage -.->|"provides"| MW3
```

Middleware execution characteristics:
- **Global middleware**: Applied to all routes via `app.use_middleware()`
- **Group middleware**: Applied only to routes within a specific group
- **Execution order**: Sequential, in the order registered
- **Mutation**: Can modify `event.res.status_code` and `event.res.headers`
- **Access**: Has read access to `event.req` and `event.params`

Common middleware use cases:
- Request logging `README.md:116-120`
- Header manipulation
- Authentication/authorization
- CORS handling
- Request timing

**Sources:** `src/index.mbt:14`, `README.md:86-109`, `README.md:116-120`

## Route Groups

Route groups allow organizing routes under a common base path with shared middleware `src/index.mbt:222-255`:

```mermaid
graph TB
    App["app = new()"]
    AppMiddleware["app.use_middleware(global_fn)"]
    
    Group["app.group('/api', configure)"]
    GroupInstance["group = new(base_path='/api')"]
    GroupMiddleware["group.use_middleware(api_fn)"]
    GroupRoutes["group.get('/users')<br/>group.post('/data')"]
    
    Merge["Merge Phase"]
    FinalMappings["app.mappings"]
    FinalStatic["app.static_routes"]
    FinalDynamic["app.dynamic_routes"]
    FinalMiddleware["app.middlewares"]
    
    App --> AppMiddleware
    App --> Group
    
    Group --> GroupInstance
    GroupInstance --> GroupMiddleware
    GroupInstance --> GroupRoutes
    
    Group --> Merge
    
    Merge -->|"merge routes"| FinalMappings
    Merge -->|"merge static"| FinalStatic
    Merge -->|"merge dynamic"| FinalDynamic
    Merge -->|"append middleware"| FinalMiddleware
    
    FinalMappings -->|"contains"| Route1["/api/users"]
    FinalMappings -->|"contains"| Route2["/api/data"]
```

Group functionality `src/index.mbt:222-255`:
1. Creates a new `Mocket` instance with combined `base_path`
2. Applies configuration function to populate routes and middleware
3. Merges group's `mappings`, `static_routes`, `dynamic_routes` into parent
4. Appends group's middleware to parent's middleware array

Example from README `README.md:86-109`:
```moonbit
app.group("/api", group => {
  group.use_middleware(event => println("API middleware"))
  group.get("/hello", _ => Text("Hello from API!"))
  group.get("/users", _ => Json({ "users": ["Alice", "Bob"] }))
})
```

This creates routes at `/api/hello` and `/api/users`, both executing the group middleware plus any global middleware.

**Sources:** `src/index.mbt:222-255`, `README.md:86-109`, `README.md:127-138`

## Type System Integration Across Backends

The core types are backend-agnostic, allowing the same application code to run on JavaScript and Native backends:

```mermaid
graph TB
    subgraph "Application Layer"
        Handler["Handler Function<br/>async (HttpEvent) -> HttpBody noraise"]
        CoreTypes["Core Types:<br/>HttpEvent, HttpRequest,<br/>HttpResponse, HttpBody"]
    end
    
    subgraph "Backend Abstraction"
        JSBackend["JavaScript Backend<br/>mocket.js.mbt"]
        NativeBackend["Native Backend<br/>mocket.native.mbt"]
    end
    
    subgraph "Platform Types"
        JSReq["HttpRequestInternal<br/>wraps Node.js req"]
        JSRes["HttpResponseInternal<br/>wraps Node.js res"]
        
        NativeReq["HttpRequestInternal<br/>wraps request_t"]
        NativeRes["HttpResponseInternal<br/>wraps response_t"]
    end
    
    Handler --> CoreTypes
    CoreTypes --> JSBackend
    CoreTypes --> NativeBackend
    
    JSBackend -->|"converts to"| CoreTypes
    NativeBackend -->|"converts to"| CoreTypes
    
    JSBackend -.->|"uses"| JSReq
    JSBackend -.->|"uses"| JSRes
    NativeBackend -.->|"uses"| NativeReq
    NativeBackend -.->|"uses"| NativeRes
```

This abstraction enables:
- **Write once, run anywhere**: Same handler code compiles for both targets
- **Backend selection at build time**: Choose target via `moon run --target js|native`
- **Consistent API**: `HttpEvent`, `HttpRequest`, `HttpResponse` behave identically across backends

See [Multi-Backend Architecture](#3) for platform-specific implementation details.

**Sources:** `src/index.mbt:1-256`, `README.md:12-35`