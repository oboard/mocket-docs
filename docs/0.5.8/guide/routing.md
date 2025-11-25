# Routing (0.5.8)

Mocket's routing system maps incoming HTTP requests to handler functions. It provides an Express.js-like API with optimized performance for both static and dynamic routes.

## Basic Routing

### HTTP Methods

Register routes using HTTP method functions:

```moonbit
let app = @mocket.new(logger=mocket.new_production_logger())

app.get("/", _event => Text("GET request"))

app.post("/users", _event => Json({ "message": "User created" }))

app.put("/users/:id", _event => Text("User updated"))

app.delete("/users/:id", _event => Text("User deleted"))
```

Available methods: `get`, `post`, `put`, `patch`, `delete`, `head`, `options`, `trace`, `connect`

### Catch-All Routes

Use `all()` to handle any HTTP method:

```moonbit
app.all("/api/*", _event => Text("API endpoint"))
```

## Route Patterns

### Static Routes

Static routes match exact paths:

```moonbit
app.get("/about", handler)
app.get("/contact", handler)
app.get("/api/status", handler)
```

### Dynamic Routes

Dynamic routes use parameters and wildcards:

#### Path Parameters

Use `:parameter` to capture path segments:

```moonbit
app.get("/users/:id", fn(event) {
  let user_id = event.params["id"]
  event.text("User ID: " + user_id)
})

app.get("/users/:id/posts/:post_id", event => {
  let user_id = event.params.get("id").unwrap_or("unknown")
  let post_id = event.params.get("post_id").unwrap_or("unknown")
  Json({ "user_id": user_id, "post_id": post_id })
})
```

#### Wildcards

Use `*` to match any path segment:

```moonbit
app.get("/files/*", event => {
  let file_path = event.params.get("_").unwrap_or("")
  Text("File path: " + file_path)
})
```

## Route Matching

### Matching Priority

Routes are matched in the order they are registered:

```moonbit
app.get("/users/admin", _event => Text("Admin user"))  // This will match first

app.get("/users/:id", _event => Text("Regular user"))  // This won't match for /users/admin
```

### Performance Characteristics

## Route Groups

Group related routes with common prefixes:

```moonbit
// API v1 routes
let api_v1 = mocket.group("/api/v1")
api_v1.get("/users", get_users_handler)
api_v1.post("/users", create_user_handler)
api_v1.get("/users/:id", get_user_handler)

// API v2 routes
let api_v2 = mocket.group("/api/v2")
api_v2.get("/users", get_users_v2_handler)
api_v2.post("/users", create_user_v2_handler)
```

## Advanced Patterns

### Optional Parameters

```moonbit
app.get("/posts/:id?", event => {
  match event.params.get("id") {
    Some(id) => Text("Post ID: " + id)
    None => Text("All posts")
  }
})
```

### Multiple Parameters

```moonbit
app.get("/api/:version/users/:id/posts/:post_id", event => {
  Json(event.params)
})
```

