# CORS (0.5.8)

Mocket provides built-in support for Cross-Origin Resource Sharing (CORS) through the `handle_cors` middleware.

## Usage

To enable CORS, use the `handle_cors` middleware in your application or route group.

```moonbit
let app = @mocket.new()

// Enable CORS for all routes with default settings
app.use_middleware(@cors.handle_cors())

// Or configure specific CORS options
app.use_middleware(@cors.handle_cors(origin="https://example.com"))

app.get("/api/data", _ => Json({ "data": "protected data" }))
```

## Configuration

The `handle_cors` function accepts the following optional arguments:

| Parameter        | Type     | Default | Description                                                  |
| :--------------- | :------- | :------ | :----------------------------------------------------------- |
| `origin`         | `String` | `"*"`   | The value for `Access-Control-Allow-Origin` header.          |
| `methods`        | `String` | `"*"`   | The value for `Access-Control-Allow-Methods` header.         |
| `allow_headers`  | `String` | `"*"`   | The value for `Access-Control-Allow-Headers` header.         |
| `expose_headers` | `String` | `"*"`   | The value for `Access-Control-Expose-Headers` header.        |
| `credentials`    | `Bool`   | `false` | Whether to set `Access-Control-Allow-Credentials` to "true". |
| `max_age`        | `Int`    | `86400` | The value for `Access-Control-Max-Age` header (in seconds).  |

## Preflight Requests

The middleware automatically handles `OPTIONS` requests (preflight requests).

- If it detects a preflight request, it sets the appropriate headers and returns an empty response, stopping further middleware execution.
- For normal requests, it sets the CORS headers and proceeds to the next middleware or handler.

