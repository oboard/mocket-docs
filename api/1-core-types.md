---
title: Core Types
---

# Core Types

This page documents the fundamental types that form the public API of the Mocket framework. These types define the data structures that applications interact with when handling HTTP requests and responses. The core types are backend-agnostic and provide a unified interface regardless of whether the application runs on JavaScript, Native, or WASM backends.

For information about route registration methods that use these types, see [Route Registration API](#4.2). For details about backend-specific type conversions, see [Multi-Backend Architecture](#3).

## Type Hierarchy Overview

The following diagram shows the relationships between all core types in the Mocket framework:

```mermaid
graph TB
    Mocket["Mocket<br/>(main framework type)"]
    HttpEvent["HttpEvent<br/>(handler input)"]
    HttpRequest["HttpRequest<br/>(request data)"]
    HttpResponse["HttpResponse<br/>(response data)"]
    HttpBody["HttpBody<br/>(enum: body content)"]
    Logger["Logger<br/>(logging system)"]
    
    Mocket -->|"contains"| Logger
    Mocket -->|"stores handlers<br/>async (HttpEvent) -> HttpBody"| HttpEvent
    HttpEvent -->|"req field"| HttpRequest
    HttpEvent -->|"res field"| HttpResponse
    HttpEvent -->|"params: Map[String,String]"| HttpEvent
    HttpRequest -->|"mut body field"| HttpBody
    
    JsonVariant["Json(Json)"]
    TextVariant["Text(StringView)"]
    HTMLVariant["HTML(StringView)"]
    BytesVariant["Bytes(BytesView)"]
    EmptyVariant["Empty"]
    
    HttpBody --> JsonVariant
    HttpBody --> TextVariant
    HttpBody --> HTMLVariant
    HttpBody --> BytesVariant
    HttpBody --> EmptyVariant
```

**Sources:** [src/pkg.generated.mbti:49-120](), [src/event.mbt:2-6]()

## HttpEvent

The `HttpEvent` struct is the primary object passed to route handlers and middleware. It encapsulates all information about the current HTTP transaction.

### Structure

| Field | Type | Description |
|-------|------|-------------|
| `req` | `HttpRequest` | The incoming HTTP request data |
| `res` | `HttpResponse` | The outgoing HTTP response (mutable fields) |
| `params` | `Map[String, String]` | Route parameters extracted from dynamic routes |

### Definition Location

The `HttpEvent` type is defined at [src/event.mbt:2-6]() and declared public in [src/pkg.generated.mbti:57-61]().

### Usage Pattern

Handlers receive an `HttpEvent` and return an `HttpBody`:

```
async fn handler(event : HttpEvent) -> HttpBody noraise
```

The `params` map contains values extracted from dynamic route segments. For example, a route pattern `/users/:id` accessed with `/users/123` would populate `params` with `{"id": "123"}`.

**Sources:** [src/event.mbt:2-6](), [src/pkg.generated.mbti:57-61]()

## HttpRequest

The `HttpRequest` struct contains all data from the incoming HTTP request.

### Structure

| Field | Type | Mutability | Description |
|-------|------|------------|-------------|
| `http_method` | `String` | Immutable | HTTP method (GET, POST, PUT, etc.) |
| `url` | `String` | Immutable | Request URL path |
| `headers` | `Map[String, String]` | Immutable | HTTP request headers |
| `body` | `HttpBody` | **Mutable** | Parsed request body |

### Definition Location

Defined at [src/pkg.generated.mbti:63-68]().

### Body Mutability

The `body` field is explicitly marked as mutable (`mut body : HttpBody`). This allows the request body to be lazily parsed or modified during request processing. The body is populated based on the `Content-Type` header by backend-specific body parsers.

### Request Lifecycle

```mermaid
sequenceDiagram
    participant Backend
    participant HttpRequestInternal
    participant HttpRequest
    participant Handler
    
    Backend->>HttpRequestInternal: "Platform-specific request"
    HttpRequestInternal->>HttpRequest: "Convert to core type"
    Note over HttpRequest: "http_method, url, headers populated"
    Note over HttpRequest: "body initially Empty"
    HttpRequest->>Handler: "Pass in HttpEvent"
    Handler->>HttpRequest: "Access body (lazy parse)"
    Note over HttpRequest: "body mutated to parsed content"
    Handler-->>Backend: "Return HttpBody"
```

**Sources:** [src/pkg.generated.mbti:63-68]()

## HttpResponse

The `HttpResponse` struct allows handlers to configure the outgoing HTTP response.

### Structure

| Field | Type | Mutability | Description |
|-------|------|------------|-------------|
| `status_code` | `Int` | **Mutable** | HTTP status code (default varies by backend) |
| `headers` | `Map[StringView, StringView]` | Immutable | Response headers to send |

### Definition Location

Defined at [src/pkg.generated.mbti:75-78]().

### Header Types

Note that response headers use `StringView` for both keys and values, while request headers use `String`. This optimization reduces memory allocations when constructing response headers from string literals.

### Setting Response Properties

Handlers modify the `HttpResponse` through the `HttpEvent.res` field:

```
async fn handler(event : HttpEvent) -> HttpBody {
  event.res.status_code = 201
  event.res.headers.set("X-Custom-Header", "value")
  Json({ "status": "created" })
}
```

**Sources:** [src/pkg.generated.mbti:75-78]()

## HttpBody

The `HttpBody` enum represents different content types that can be sent or received in HTTP messages.

### Variants

| Variant | Payload Type | Use Case |
|---------|--------------|----------|
| `Json(Json)` | `Json` | JSON data (auto Content-Type: application/json) |
| `Text(StringView)` | `StringView` | Plain text (auto Content-Type: text/plain) |
| `HTML(StringView)` | `StringView` | HTML content (auto Content-Type: text/html) |
| `Bytes(BytesView)` | `BytesView` | Binary data (auto Content-Type: application/octet-stream) |
| `Empty` | None | No response body (for 204 No Content, etc.) |

### Definition Location

Defined at [src/pkg.generated.mbti:49-55]().

### Content-Type Handling

The framework automatically sets the appropriate `Content-Type` header based on the returned `HttpBody` variant. Backends convert these variants to platform-specific representations.

### Variant Selection Guide

```mermaid
graph TD
    Start["Select HttpBody variant"]
    
    Start --> Q1{"Data format?"}
    Q1 -->|"Structured data"| Json["Json(json_data)"]
    Q1 -->|"Human readable"| Q2{"Markup?"}
    Q1 -->|"Binary"| Bytes["Bytes(bytes_view)"]
    Q1 -->|"No content"| Empty["Empty"]
    
    Q2 -->|"Yes"| HTML["HTML(html_string)"]
    Q2 -->|"No"| Text["Text(text_string)"]
    
    Json --> Auto1["Content-Type:<br/>application/json"]
    HTML --> Auto2["Content-Type:<br/>text/html"]
    Text --> Auto3["Content-Type:<br/>text/plain"]
    Bytes --> Auto4["Content-Type:<br/>application/octet-stream"]
    Empty --> Auto5["No Content-Type"]
```

**Sources:** [src/pkg.generated.mbti:49-55]()

## Mocket

The `Mocket` struct is the main framework instance that holds routing configuration, middleware, and server state.

### Structure

| Field | Type | Description |
|-------|------|-------------|
| `base_path` | `String` | Base path prefix for all routes |
| `mappings` | `Map[(String, String), async (HttpEvent) -> HttpBody noraise]` | Complete registry of all route handlers |
| `middlewares` | `Array[(String, async (HttpEvent) -> Unit noraise)]` | Registered middleware with their base paths |
| `static_routes` | `Map[String, Map[String, async (HttpEvent) -> HttpBody noraise]]` | O(1) lookup cache for static routes |
| `dynamic_routes` | `Map[String, Array[(String, async (HttpEvent) -> HttpBody noraise)]]` | Regex-matched dynamic routes |
| `logger` | `Logger` | Logging system instance |

### Definition Location

Defined at [src/pkg.generated.mbti:113-120]().

### Route Storage Architecture

The `Mocket` type uses a dual-storage strategy for performance optimization:

```mermaid
graph TB
    subgraph "Route Registration"
        Handler["async (HttpEvent) -> HttpBody noraise"]
        OnMethod["on(method, path, handler)"]
        Handler --> OnMethod
    end
    
    subgraph "Storage Structures"
        Mappings["mappings<br/>Map[(String, String), Handler]<br/>(Complete Registry)"]
        StaticRoutes["static_routes<br/>Map[Method, Map[Path, Handler]]<br/>(O(1) Lookup)"]
        DynamicRoutes["dynamic_routes<br/>Map[Method, Array[(Pattern, Handler)]]<br/>(Regex Match)"]
    end
    
    subgraph "Route Lookup"
        FindRoute["find_route(method, path)"]
        CheckStatic{"Path exact match?"}
        CheckDynamic["Regex match patterns"]
        FindRoute --> CheckStatic
        CheckStatic -->|"Yes"| StaticRoutes
        CheckStatic -->|"No"| CheckDynamic
        CheckDynamic --> DynamicRoutes
    end
    
    OnMethod --> Mappings
    OnMethod --> StaticRoutes
    OnMethod --> DynamicRoutes
    
    StaticRoutes -.->|"fast path"| CheckStatic
    DynamicRoutes -.->|"slow path"| CheckDynamic
```

### Async Handler Signature

All route handlers in Mocket use the signature `async (HttpEvent) -> HttpBody noraise`. The `noraise` annotation indicates these handlers cannot raise exceptions, enforcing error handling through the return value.

**Sources:** [src/pkg.generated.mbti:113-120](), [src/pkg.generated.mbti:121-134]()

## Logger

The `Logger` struct provides observability for the framework's internal operations and application-level logging.

### Structure

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | `Bool` | Whether logging is active |
| `level` | `LogLevel` | Minimum log level to output |

### LogLevel Enum

```
pub enum LogLevel {
  Debug
  Info
  Warn
  Error
}
```

### Definition Location

Defined at [src/pkg.generated.mbti:85-111]().

### Specialized Methods

The `Logger` type provides route-specific logging methods that track routing operations:

| Method | Purpose |
|--------|---------|
| `route_added(path)` | Route added to registry |
| `route_created(path)` | New route definition created |
| `route_dynamic(method, pattern)` | Dynamic route registered |
| `route_found(method, path)` | Route successfully matched |
| `route_lookup(method, path)` | Route lookup initiated |
| `route_merge_existing(path)` | Route merged with existing |
| `route_merge_new(path)` | New route group merged |
| `route_not_found(path)` | No route matched request |
| `route_register(method, path)` | Route registration started |
| `route_static(method, path)` | Static route registered |
| `routes_available(paths)` | List all registered routes |

### Logger Construction

The framework provides three factory functions defined in [src/pkg.generated.mbti:13-18]():

- `new_logger(enabled?: Bool, level?: LogLevel) -> Logger` - Custom configuration
- `new_debug_logger() -> Logger` - All logs enabled at Debug level
- `new_production_logger() -> Logger` - Info level and above

**Sources:** [src/pkg.generated.mbti:85-111](), [src/pkg.generated.mbti:13-18]()

## Internal Types

The framework uses internal types for backend-specific implementations that are not part of the public API but appear in the type system.

### HttpRequestInternal and HttpResponseInternal

These types are marked `#external` and represent platform-specific request/response objects:

```mermaid
graph LR
    subgraph "Backend Layer"
        NodeReq["Node.js req object"]
        NodeRes["Node.js res object"]
        CReq["Mongoose request_t"]
        CRes["Mongoose response_t"]
    end
    
    subgraph "Internal Types"
        ReqInternal["HttpRequestInternal<br/>#external type"]
        ResInternal["HttpResponseInternal<br/>#external type"]
    end
    
    subgraph "Core Types"
        HttpReq["HttpRequest"]
        HttpRes["HttpResponse"]
    end
    
    NodeReq -->|"JavaScript backend"| ReqInternal
    NodeRes -->|"JavaScript backend"| ResInternal
    CReq -->|"Native backend"| ReqInternal
    CRes -->|"Native backend"| ResInternal
    
    ReqInternal -->|"converts to"| HttpReq
    ResInternal -->|"converts to"| HttpRes
```

### Methods on Internal Types

Defined at [src/pkg.generated.mbti:70-83]():

**HttpRequestInternal:**
- `req_method(Self) -> String` - Extract HTTP method
- `url(Self) -> String` - Extract request URL

**HttpResponseInternal:**
- `end(Self, @js.Value) -> Unit` - Send response (JavaScript-specific)
- `url(Self) -> String` - Get response URL

These methods provide the bridge between platform-specific implementations and the core framework types.

**Sources:** [src/pkg.generated.mbti:70-83]()

## Type Relationships in Request Processing

The following diagram shows how core types interact during a complete request-response cycle:

```mermaid
sequenceDiagram
    participant R as HttpRequestInternal
    participant M as Mocket
    participant E as HttpEvent
    participant H as Handler
    participant B as HttpBody
    
    R->>M: "Platform request arrives"
    M->>E: "Create HttpEvent"
    Note over E: "req: HttpRequest<br/>res: HttpResponse<br/>params: Map"
    
    M->>M: "find_route(method, path)"
    Note over M: "Check static_routes<br/>Check dynamic_routes"
    
    M->>M: "Execute middlewares"
    Note over M: "Array[(path, handler)]"
    
    M->>H: "Invoke handler(HttpEvent)"
    H->>E: "Access event.req fields"
    H->>E: "Modify event.res.status_code"
    H->>E: "Modify event.res.headers"
    H->>B: "Return HttpBody variant"
    
    B-->>M: "Json/Text/HTML/Bytes/Empty"
    M->>M: "Logger.route_found()"
    M-->>R: "Convert to platform response"
```

**Sources:** [src/pkg.generated.mbti:49-120](), [src/event.mbt:2-6]()

## Summary Table

| Type | Purpose | Mutability | Location |
|------|---------|------------|----------|
| `Mocket` | Framework instance with routing and middleware | Contains mutable maps | [src/pkg.generated.mbti:113-120]() |
| `HttpEvent` | Request context passed to handlers | Immutable wrapper | [src/event.mbt:2-6]() |
| `HttpRequest` | Incoming request data | `body` field is mutable | [src/pkg.generated.mbti:63-68]() |
| `HttpResponse` | Outgoing response configuration | `status_code` is mutable | [src/pkg.generated.mbti:75-78]() |
| `HttpBody` | Content type enum | Immutable value | [src/pkg.generated.mbti:49-55]() |
| `Logger` | Logging system | Immutable configuration | [src/pkg.generated.mbti:92-111]() |

**Sources:** [src/pkg.generated.mbti:49-120](), [src/event.mbt:2-6]()