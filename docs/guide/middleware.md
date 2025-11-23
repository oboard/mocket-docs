# Middleware

Middleware functions are functions that have access to the request object (`req`), the response object (`res`), and the next middleware function in the application’s request-response cycle.

## Overview

Mocket uses an "Onion Model" for middleware execution. When a request comes in, it passes through the middleware layers one by one until it reaches the final route handler. Then, the response bubbles back up through the layers.

Middleware can perform the following tasks:

- Execute any code.
- Make changes to the request and the response objects.
- End the request-response cycle.
- Call the next middleware in the stack.

## Usage

You can register middleware using the `use` method on your application instance.

```moonbit
let app = @mocket.new()

// Global middleware
app.use_middleware(my_middleware)

// Path-specific middleware
app.use_middleware(my_middleware, base_path="/api")
```

## Writing Middleware

A middleware function takes a `MocketEvent` and a `next` function as arguments. It must return an `HttpBody`.

```moonbit
pub async fn my_middleware(
  event : @mocket.MocketEvent,
  next : async () -> @mocket.HttpBody noraise
) -> @mocket.HttpBody noraise {
  // Pre-processing
  println("Request received: " + event.req.path)

  // Call the next middleware/handler
  let result = next()

  // Post-processing
  println("Response sent")

  result
}
```

### Example: Logger Middleware

Here is a simple logger middleware that logs the request method and path.

```moonbit
pub async fn logger_middleware(
  event : @mocket.MocketEvent,
  next : async () -> @mocket.HttpBody noraise,
) -> @mocket.HttpBody noraise {
  let start_time = @env.now()
  let res = next()
  let duration = @env.now() - start_time
  println("\{event.req.http_method} \{event.req.url} - \{duration}ms")
  res
}
```

### Example: Authentication Middleware

Middleware can also intercept requests and return a response early, effectively blocking access.

```moonbit
pub async fn auth_middleware(
  event : @mocket.MocketEvent,
  next : async () -> @mocket.HttpBody noraise
) -> @mocket.HttpBody noraise {
  match event.req.headers.get("Authorization") {
    Some(token) => {
      if validate_token(token) {
        next()
      } else {
        Json({ "error": "Invalid token" }, status=401)
      }
    }
    None => Json({ "error": "Unauthorized" }, status=401)
  }
}
```

## Built-in Middleware

Mocket comes with some built-in middleware:

- **CORS**: Handles Cross-Origin Resource Sharing. See [CORS](./cors.md) for details.
