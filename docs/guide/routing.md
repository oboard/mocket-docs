# Routing

Mocket's routing system maps incoming HTTP requests to handler functions. It provides an Express.js-like API with optimized performance for both static and dynamic routes.

## Basic Routing

### HTTP Methods

Register routes using HTTP method functions:

```moonbit
let app = @mocket.new()

app.get("/", _event => "GET request")

app.post("/users", _event => ({ "message": "User created" } : Json))

app.put("/users/:id", _event => "User updated")

app.delete("/users/:id", _event => "User deleted")
```

Available methods: `get`, `post`, `put`, `patch`, `delete`, `head`, `options`, `trace`, `connect`

### Catch-All Routes

Use `all()` to handle any HTTP method:

```moonbit
app.all("/api/**", _event => "API endpoint")
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
  "User ID: " + user_id
})

app.get("/users/:id/posts/:post_id", event => {
  let user_id = event.params.get("id").unwrap_or("unknown")
  let post_id = event.params.get("post_id").unwrap_or("unknown")
  ({ "user_id": user_id, "post_id": post_id } : Json)
})
```

#### Wildcards

Use `*` to match one path segment:

```moonbit
app.get("/files/*", event => {
  let file_path = event.params.get("_").unwrap_or("")
  "File path: " + file_path
})
```

Use `**` to match the rest of a path:

```moonbit
app.get("/static/**", event => {
  let file_path = event.params.get("_").unwrap_or("")
  "File path: " + file_path
})
```

## Route Matching

### Matching Priority

Static routes are checked before dynamic routes for the same HTTP method. Dynamic
routes are checked in the order they were registered:

```moonbit
app.get("/users/admin", _event => "Admin user")  // This will match first

app.get("/users/:id", _event => "Regular user")  // This won't match for /users/admin
```

## Route Groups

Group related routes with common prefixes:

```moonbit
let app = @mocket.new()

app.group("/api/v1", api => {
  api.get("/users", _ => "List users")
  api.post("/users", _ => "Create user")
  api.get("/users/:id", event => {
    let id = event.params.get("id").unwrap_or("unknown")
    "User " + id
  })
})
```

## Advanced Patterns

### Multiple Parameters

```moonbit
app.get("/api/:version/users/:id/posts/:post_id", event => {
  event.params
})
```
