---
title: Native Backend
---

# Native Backend

## Purpose and Scope

The Native Backend provides HTTP server functionality by integrating with the Mongoose embedded web server library through C Foreign Function Interface (FFI). This backend compiles MoonBit code to native executables, offering direct system integration and performance characteristics suited for production deployments.

This page covers the native backend implementation, FFI bindings, and integration with Mongoose. For the JavaScript backend, see [JavaScript Backend](#3.1). For general backend concepts, see [Multi-Backend Architecture](#3). For Mongoose-specific integration details, see [Mongoose Integration](#3.2.1).

---

## Architecture Overview

The native backend uses a three-layer architecture: MoonBit application code communicates with backend-agnostic types, which are converted to/from platform-specific types, which interface with C code through FFI bindings.

### Native Backend Layered Architecture

```mermaid
graph TB
    subgraph "MoonBit Core Layer"
        Mocket["Mocket<br/>(framework instance)"]
        HttpEvent["HttpEvent"]
        HttpRequest["HttpRequest"]
        HttpResponse["HttpResponse"]
        HttpBody["HttpBody enum"]
    end
    
    subgraph "Native Backend Layer<br/>mocket.native.mbt"
        ServeFfi["serve_ffi()<br/>entry point"]
        HandleReq["handle_request_native()<br/>request handler"]
        ServerMap["server_map: Map[Int, Mocket]<br/>port to instance"]
        ToCStr["to_cstr()<br/>MoonBit → C"]
        FromCStr["from_cstr()<br/>C → MoonBit"]
    end
    
    subgraph "FFI Type Layer<br/>mocket.native.mbt"
        HttpServerInt["HttpServerInternal<br/>#external"]
        HttpRequestInt["HttpRequestInternal<br/>#external"]
        HttpResponseInt["HttpResponseInternal<br/>#external"]
        ReqMethod["req_method() extern c"]
        ReqUrl["url() extern c"]
        ReqBody["body() extern c"]
        ResStatus["status() extern c"]
        ResEnd["end() extern c"]
    end
    
    subgraph "C FFI Layer<br/>mocket.stub.c"
        CreateServer["create_server()"]
        ServerListen["server_listen()"]
        RequestT["request_t struct"]
        ResponseT["response_t struct"]
        ServerT["server_t struct"]
        ReqMethodC["req_method()"]
        ResEndC["res_end()"]
    end
    
    subgraph "Mongoose Library"
        MgMgr["mg_mgr"]
        MgHttpListen["mg_http_listen()"]
        MgHttpMessage["mg_http_message"]
        EvHandler["ev_handler()"]
    end
    
    Mocket --> ServeFfi
    ServeFfi --> CreateServer
    ServeFfi --> ServerListen
    ServeFfi --> ServerMap
    
    HandleReq --> Mocket
    HandleReq --> ToCStr
    HandleReq --> FromCStr
    HandleReq --> HttpEvent
    
    HttpRequestInt --> ReqMethod
    HttpRequestInt --> ReqUrl
    HttpRequestInt --> ReqBody
    HttpResponseInt --> ResStatus
    HttpResponseInt --> ResEnd
    
    ReqMethod -.->|"FFI binding"| ReqMethodC
    ResEnd -.->|"FFI binding"| ResEndC
    
    CreateServer --> ServerT
    ServerListen --> MgMgr
    RequestT --> ReqMethodC
    ResponseT --> ResEndC
    
    ServerT --> MgHttpListen
    MgHttpListen --> EvHandler
    EvHandler --> MgHttpMessage
    EvHandler --> RequestT
    EvHandler --> ResponseT
```

**Sources:** `src/mocket.native.mbt:1-222`, `src/mocket.stub.c:1-354`

---

## FFI Type System

The native backend defines three external types that represent opaque C pointers. These types are never instantiated in MoonBit; they are passed to and from C functions.

### External Type Definitions

| MoonBit Type | C Equivalent | Purpose |
|--------------|--------------|---------|
| `HttpServerInternal` | `server_t*` | Server instance handle |
| `HttpRequestInternal` | `request_t*` | Incoming HTTP request |
| `HttpResponseInternal` | `response_t*` | Outgoing HTTP response |

**Sources:** `src/mocket.native.mbt:2-11`

### FFI Function Bindings

All FFI functions are declared with `extern "c"` and map MoonBit function calls to C implementations:

```mermaid
graph LR
    subgraph "MoonBit FFI Declarations"
        ReqMethod["req_method()<br/>HttpRequestInternal → CStr"]
        ReqUrl["url()<br/>HttpRequestInternal → CStr"]
        ReqHeaders["headers()<br/>HttpRequestInternal → CStr"]
        ReqBody["body()<br/>HttpRequestInternal → Bytes"]
        ReqBodyLen["req_body_len()<br/>HttpRequestInternal → Int"]
        ResStatus["status()<br/>HttpResponseInternal, Int"]
        ResSetHeader["set_header()<br/>HttpResponseInternal, CStr, CStr"]
        ResEnd["end()<br/>HttpResponseInternal, CStr"]
        ResEndBytes["end_bytes()<br/>HttpResponseInternal, Bytes"]
        CreateSrv["create_server()<br/>FuncRef → HttpServerInternal"]
        SrvListen["server_listen()<br/>HttpServerInternal, Int"]
    end
    
    subgraph "C Implementation"
        CReqMethod["req_method()<br/>src/mocket.stub.c:99"]
        CReqUrl["req_url()<br/>src/mocket.stub.c:113"]
        CReqHeaders["req_headers()<br/>src/mocket.stub.c:127"]
        CReqBody["req_body()<br/>src/mocket.stub.c:150"]
        CReqBodyLen["req_body_len()<br/>src/mocket.stub.c:159"]
        CResStatus["res_status()<br/>src/mocket.stub.c:56"]
        CResSetHeader["res_set_header()<br/>src/mocket.stub.c:45"]
        CResEnd["res_end()<br/>src/mocket.stub.c:75"]
        CResEndBytes["res_end_bytes()<br/>src/mocket.stub.c:86"]
        CCreateSrv["create_server()<br/>src/mocket.stub.c:260"]
        CSrvListen["server_listen()<br/>src/mocket.stub.c:270"]
    end
    
    ReqMethod -.-> CReqMethod
    ReqUrl -.-> CReqUrl
    ReqHeaders -.-> CReqHeaders
    ReqBody -.-> CReqBody
    ReqBodyLen -.-> CReqBodyLen
    ResStatus -.-> CResStatus
    ResSetHeader -.-> CResSetHeader
    ResEnd -.-> CResEnd
    ResEndBytes -.-> CResEndBytes
    CreateSrv -.-> CCreateSrv
    SrvListen -.-> CSrvListen
```

**Sources:** `src/mocket.native.mbt:14-89`, `src/mocket.stub.c:45-285`

Key characteristics:
- `#owned` annotation indicates the C side takes ownership of parameters
- `FuncRef` types enable callback from C to MoonBit
- `@native.CStr` is used for C string interoperability

---

## Request Processing Pipeline

The request processing flow starts when Mongoose receives an HTTP request and invokes the registered handler callback.

### Request Flow Sequence

```mermaid
sequenceDiagram
    participant Client
    participant Mongoose as "Mongoose<br/>mg_mgr_poll()"
    participant EvHandler as "ev_handler()<br/>mocket.stub.c:213"
    participant Handler as "MoonBit handler<br/>FuncRef callback"
    participant HandleNative as "handle_request_native()<br/>mocket.native.mbt:108"
    participant FindRoute as "find_route()"
    participant ReadBody as "read_body()<br/>body_reader.mbt"
    participant ExecMiddleware as "execute_middlewares()"
    participant UserHandler as "Route handler"
    participant Response as "Response processing"
    
    Client->>Mongoose: "HTTP request"
    Mongoose->>EvHandler: "MG_EV_HTTP_MSG event"
    EvHandler->>EvHandler: "Create request_t, response_t<br/>from mg_http_message"
    EvHandler->>Handler: "srv->handler(port, req, res)"
    Handler->>HandleNative: "Invoke with port, req, res"
    
    HandleNative->>HandleNative: "from_cstr(req.url())<br/>from_cstr(req.req_method())"
    HandleNative->>HandleNative: "Parse headers from req.headers()"
    HandleNative->>FindRoute: "mocket.find_route(method, path)"
    
    alt Route found
        FindRoute-->>HandleNative: "(handler, params)"
        
        alt POST request
            HandleNative->>HandleNative: "req.req_body_len()"
            HandleNative->>HandleNative: "req.body()[0:len]"
            HandleNative->>ReadBody: "read_body(headers, bytes)"
            ReadBody-->>HandleNative: "HttpBody"
        end
        
        HandleNative->>HandleNative: "Create HttpEvent"
        HandleNative->>ExecMiddleware: "execute_middlewares()"
        ExecMiddleware->>UserHandler: "handler(event)"
        UserHandler-->>HandleNative: "HttpBody"
        
        HandleNative->>Response: "Set Content-Type header"
        HandleNative->>Response: "res.status(status_code)"
        HandleNative->>Response: "res.set_header() for each"
        
        alt Binary response
            HandleNative->>Response: "res.end_bytes(bytes)"
        else Text response
            HandleNative->>Response: "res.end(to_cstr(body))"
        end
        
        Response->>EvHandler: "mg_http_reply()"
        EvHandler->>Client: "HTTP response"
    else Route not found
        FindRoute-->>HandleNative: "None"
        HandleNative->>Response: "res.status(404)"
        HandleNative->>Response: "res.end(\"Not Found\")"
        Response->>Client: "404 response"
    end
```

**Sources:** `src/mocket.stub.c:213-257`, `src/mocket.native.mbt:108-207`

### Entry Point: serve_ffi

The `serve_ffi()` function is the entry point for starting a native HTTP server:

```mermaid
graph TB
    ServeFfi["serve_ffi(mocket, port)<br/>mocket.native.mbt:95"]
    ServerMap["server_map[port] = mocket<br/>Store instance"]
    CreateServer["create_server(handler_fn)<br/>Create C server"]
    HandlerFn["FuncRef callback<br/>handle_request_native"]
    ServerListen["server_listen(server, port)<br/>Start event loop"]
    MgMgrInit["mg_mgr_init()<br/>Initialize Mongoose"]
    MgHttpListen["mg_http_listen()<br/>Bind to port"]
    MgMgrPoll["mg_mgr_poll()<br/>Event loop"]
    
    ServeFfi --> ServerMap
    ServerMap --> CreateServer
    CreateServer --> HandlerFn
    HandlerFn --> ServerListen
    ServerListen --> MgMgrInit
    MgMgrInit --> MgHttpListen
    MgHttpListen --> MgMgrPoll
    MgMgrPoll --> MgMgrPoll
```

**Sources:** `src/mocket.native.mbt:95-105`, `src/mocket.stub.c:260-285`

The `server_map` global variable (`src/mocket.native.mbt:92`) maps port numbers to `Mocket` instances, allowing the single C callback to dispatch to multiple application instances.

---

## Type Conversion Layer

The native backend requires conversion between MoonBit's UTF-8 strings and C's null-terminated strings (`CStr`).

### String Conversion Functions

| Function | Direction | Implementation |
|----------|-----------|----------------|
| `to_cstr()` | MoonBit → C | Encodes UTF-8 string, returns unsafe-coerced pointer |
| `from_cstr()` | C → MoonBit | Decodes bytes (minus null terminator) to UTF-8 string |

**Implementation details:**

```mermaid
graph LR
    subgraph "to_cstr: MoonBit → C"
        MbString["MoonBit value<br/>(Show trait)"]
        ToString["to_string()"]
        Utf8Encode["@encoding/utf8.encode()"]
        UnsafeCoerce["@native.unsafe_coerce()"]
        CStrOut["@native.CStr"]
        
        MbString --> ToString
        ToString --> Utf8Encode
        Utf8Encode --> UnsafeCoerce
        UnsafeCoerce --> CStrOut
    end
    
    subgraph "from_cstr: C → MoonBit"
        CStrIn["@native.CStr"]
        ToBytes["to_bytes()"]
        SliceNull["[:-1]<br/>Remove null terminator"]
        Utf8Decode["@encoding/utf8.decode()"]
        StringOut["String"]
        
        CStrIn --> ToBytes
        ToBytes --> SliceNull
        SliceNull --> Utf8Decode
        Utf8Decode --> StringOut
    end
```

**Sources:** `src/mocket.native.mbt:210-221`

**Key observations:**
- `to_cstr()` uses `unsafe_coerce()` to convert `Bytes` to `CStr` without copying
- `from_cstr()` removes the trailing null byte (`[:-1]`) before UTF-8 decoding
- Both functions assume valid UTF-8; `from_cstr()` panics on invalid input

---

## Request Handling

The `handle_request_native()` function (`src/mocket.native.mbt:108-207`) orchestrates the complete request lifecycle.

### Request Data Extraction

```mermaid
graph TB
    Start["handle_request_native(port, req, res)"]
    GetMocket["mocket = server_map[port]"]
    ExtractUrl["url = from_cstr(req.url())"]
    ExtractMethod["method = from_cstr(req.req_method())"]
    ExtractHeaders["Parse headers string"]
    SplitHeaders["Split by newline"]
    ParsePairs["Split each by ': '"]
    BuildMap["Map[String, String]"]
    
    Start --> GetMocket
    GetMocket --> ExtractUrl
    ExtractUrl --> ExtractMethod
    ExtractMethod --> ExtractHeaders
    ExtractHeaders --> SplitHeaders
    SplitHeaders --> ParsePairs
    ParsePairs --> BuildMap
```

**Sources:** `src/mocket.native.mbt:113-148`

Header parsing logic (`src/mocket.native.mbt:136-148`):
1. Get headers as single string from `req.headers()`
2. Split by newlines
3. Split each line by `": "` to get key-value pairs
4. Filter empty pairs
5. Convert to `Map[String, String]`

### Request Body Parsing

For POST requests, the body is read and parsed based on `Content-Type`:

```mermaid
graph TB
    CheckMethod{"http_method == POST?"}
    GetBodyLen["len = req.req_body_len()"]
    GetBodyBytes["bytes = req.body()[0:len]"]
    ReadBody["read_body(headers, bytes)"]
    CheckContentType{"Content-Type?"}
    ParseJson["Json: UTF-8 decode + @json.parse()"]
    ParseText["Text: UTF-8 decode"]
    RawBytes["Bytes: raw BytesView"]
    SetBody["event.req.body = result"]
    
    CheckMethod -->|Yes| GetBodyLen
    CheckMethod -->|No| SetBody
    GetBodyLen --> GetBodyBytes
    GetBodyBytes --> ReadBody
    ReadBody --> CheckContentType
    CheckContentType -->|"application/json"| ParseJson
    CheckContentType -->|"text/plain or text/html"| ParseText
    CheckContentType -->|Other| RawBytes
    ParseJson --> SetBody
    ParseText --> SetBody
    RawBytes --> SetBody
```

**Sources:** `src/mocket.native.mbt:162-173`, `src/body_reader.mbt:9-29`

The `read_body()` function (`src/body_reader.mbt:9-29`) returns different `HttpBody` variants:
- `Json`: For `application/json` Content-Type
- `Text`: For `text/plain` or `text/html`
- `Bytes`: For all other types or missing Content-Type

---

## Response Handling

After route handler execution, the response is serialized and sent via Mongoose.

### Response Serialization Flow

```mermaid
graph TB
    HandlerResult["HttpBody from handler"]
    CheckEmpty{"body is Empty?"}
    SetContentType["Set Content-Type header<br/>based on body type"]
    SetStatus["res.status(event.res.status_code)"]
    SetHeaders["For each header:<br/>res.set_header(to_cstr(k), to_cstr(v))"]
    CheckBytes{"body is Bytes?"}
    EndBytes["res.end_bytes(bytes.to_bytes())"]
    MatchBody["Match body type"]
    SerializeHtml["HTML(s) → to_cstr(s.to_string())"]
    SerializeText["Text(s) → to_cstr(s.to_string())"]
    SerializeJson["Json(j) → to_cstr(j.stringify())"]
    EndCstr["res.end(cstr)"]
    MgHttpReply["mg_http_reply()<br/>Send to client"]
    
    HandlerResult --> CheckEmpty
    CheckEmpty -->|No| SetContentType
    CheckEmpty -->|Yes| SetStatus
    SetContentType --> SetStatus
    SetStatus --> SetHeaders
    SetHeaders --> CheckBytes
    CheckBytes -->|Yes| EndBytes
    CheckBytes -->|No| MatchBody
    MatchBody --> SerializeHtml
    MatchBody --> SerializeText
    MatchBody --> SerializeJson
    SerializeHtml --> EndCstr
    SerializeText --> EndCstr
    SerializeJson --> EndCstr
    EndBytes --> MgHttpReply
    EndCstr --> MgHttpReply
```

**Sources:** `src/mocket.native.mbt:174-206`

### Content-Type Mapping

| HttpBody Variant | Content-Type Header |
|------------------|---------------------|
| `Bytes(_)` | `application/octet-stream` |
| `HTML(_)` | `text/html; charset=utf-8` |
| `Text(_)` | `text/plain; charset=utf-8` |
| `Json(_)` | `application/json; charset=utf-8` |
| `Empty` | (no header set) |

**Sources:** `src/mocket.native.mbt:181-187`

Response functions use different C endpoints:
- `res.end_bytes()` for binary data (`src/mocket.native.mbt:194-195`)
- `res.end()` for text data (`src/mocket.native.mbt:197-204`)

---

## C Layer Implementation Details

The C stub (`src/mocket.stub.c`) provides the glue between Mongoose and MoonBit.

### Core C Structures

```mermaid
graph TB
    subgraph "server_t struct"
        SrvMgr["mg_mgr mgr<br/>Mongoose manager"]
        SrvHandler["request_handler_t handler<br/>MoonBit callback"]
        SrvPort["int port"]
    end
    
    subgraph "request_t struct"
        ReqHm["mg_http_message* hm<br/>Parsed HTTP message"]
        ReqBody["mg_str body<br/>Body buffer"]
        ReqCallbacks["Callback function pointers<br/>on_headers, on_body_chunk, etc."]
    end
    
    subgraph "response_t struct"
        ResConn["mg_connection* c<br/>Socket connection"]
        ResStatus["int status<br/>HTTP status code"]
        ResHeaders["header_t headers[32]<br/>Response headers"]
        ResHeaderCount["int header_count"]
    end
    
    subgraph "header_t struct"
        HeaderKey["char key[128]"]
        HeaderValue["char value[256]"]
    end
    
    ResHeaders -.-> HeaderKey
    ResHeaders -.-> HeaderValue
```

**Sources:** `src/mocket.stub.c:6-42`

### Event Handler

The `ev_handler()` function (`src/mocket.stub.c:213-257`) is registered as Mongoose's event callback:

```mermaid
graph TB
    EvHandler["ev_handler(conn, event, ev_data)"]
    CheckEvent{"event == MG_EV_HTTP_MSG?"}
    GetServer["srv = (server_t*)c->fn_data"]
    CastMessage["hm = (mg_http_message*)ev_data"]
    InitReq["Initialize request_t"]
    InitRes["Initialize response_t<br/>status=200"]
    CheckHandler{"srv->handler exists?"}
    CallHandler["srv->handler(port, &req, &res)"]
    Invoke404["mg_http_reply(c, 404, ..., \"Not Found\")"]
    
    EvHandler --> CheckEvent
    CheckEvent -->|Yes| GetServer
    CheckEvent -->|No| Return["Return"]
    GetServer --> CastMessage
    CastMessage --> InitReq
    InitReq --> InitRes
    InitRes --> CheckHandler
    CheckHandler -->|Yes| CallHandler
    CheckHandler -->|No| Invoke404
```

**Sources:** `src/mocket.stub.c:213-257`

Key points:
- Mongoose calls `ev_handler()` for all connection events
- Only `MG_EV_HTTP_MSG` events (complete HTTP requests) are processed
- `server_t` is retrieved from `c->fn_data` (set during `mg_http_listen()`)
- Request/response structs are stack-allocated and passed to the MoonBit handler

---

## Performance Characteristics

The native backend offers distinct performance properties:

### Performance Profile

| Aspect | Characteristic | Reason |
|--------|----------------|--------|
| **Startup** | Fast | Native binary, no runtime initialization |
| **Memory** | Low overhead | Direct C interop, no JavaScript VM |
| **Request latency** | Low | No async/await overhead, single-threaded event loop |
| **Static routes** | O(1) lookup | Hash map in MoonBit layer |
| **Dynamic routes** | O(n) regex | Regex matching per request |
| **String conversion** | Minimal copies | `unsafe_coerce` for MoonBit→C, single copy for C→MoonBit |
| **Binary responses** | Zero-copy | `end_bytes()` passes pointer directly |

**Sources:** `src/mocket.native.mbt:210-221`, `src/mocket.stub.c:86-94`

### Comparison with JavaScript Backend

| Feature | Native Backend | JavaScript Backend |
|---------|----------------|-------------------|
| Async support | No (event loop only) | Yes (Promise-based) |
| Type conversion | UTF-8 encoding required | Direct JS value interop |
| Response streaming | Callback-based (unimplemented) | Stream-based |
| Deployment | Single binary | Node.js required |
| Memory safety | FFI unsafe operations | Safe JS interop |

---

## Error Handling

The native backend uses MoonBit's exception system for error propagation.

### Error Flow

```mermaid
graph TB
    ReadBody["read_body() raise BodyError"]
    CatchBlock["catch block"]
    SetStatus404["res.status(400)"]
    ResEnd["res.end(\"Invalid body\")"]
    Return["return"]
    
    ReadBody -->|"Error raised"| CatchBlock
    CatchBlock --> SetStatus404
    SetStatus404 --> ResEnd
    ResEnd --> Return
```

**Sources:** `src/mocket.native.mbt:165-171`, `src/body_reader.mbt:2-6`

Error types defined in `body_reader.mbt`:
- `InvalidJsonCharset`: UTF-8 decoding failed
- `InvalidJson`: JSON parsing failed  
- `InvalidText`: Text UTF-8 decoding failed

The native backend returns HTTP 400 for body parsing errors and HTTP 404 for route not found.

---

## Limitations and Future Work

Current limitations:
1. **No async support**: Cannot use `async` functions in route handlers (JavaScript backend only)
2. **Callback staging incomplete**: `on_headers`, `on_body_chunk` callbacks defined but not utilized
3. **Single-threaded**: Mongoose event loop runs on one thread
4. **Static header buffer**: Maximum 32 headers, 128-byte keys, 256-byte values (`src/mocket.stub.c:12`)
5. **Static string buffers**: URL limited to 512 bytes, method to 16 bytes (`src/mocket.stub.c:103-108`)

Future enhancements:
- Request/response streaming via staged callbacks
- Multi-threaded Mongoose configuration
- WebSocket support through Mongoose
- SSL/TLS configuration exposure

**Sources:** `src/mocket.stub.c:18-33`, `src/mocket.stub.c:99-124`