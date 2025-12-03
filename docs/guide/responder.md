# Responder Guide

Responder is Mocket’s unified response protocol. Route handlers and middlewares return an object that implements `Responder`. The runtime uses it to populate `HttpResponse` headers and status, and to serialize the body.

## Responder Trait
```moonbit
trait Responder {
  options(Self, res: HttpResponse) -> Unit
  output(Self, buf: @buffer.Buffer) -> Unit
}
```

Common constructs:

- Text: return `String` / `StringView`.
- JSON: return `Json` or an object’s `.to_json()`; or `HttpResponse::json(...)`.
- Binary: return `Bytes`.
- HTML: use `html(showable)`.
- Full response: return `HttpResponse::new(...).to_responder()`.

## Custom Responder

Implement `Responder` for your own type to control headers and serialization, e.g., CSV:

```moonbit
struct Csv(String)

impl @mocket.Responder for Csv with options(_, res) -> Unit {
  res.headers["Content-Type"] = "text/csv; charset=utf-8"
}

impl @mocket.Responder for Csv with output(self, buf) -> Unit {
  buf.write_bytes(@encoding/utf8.encode(self.0))
}

@mocket.HttpResponse::new(OK).body(Csv("a,b,c\n1,2,3"))
```

## Usage Example

```moonbit
// Text Response
app.get("/", _event => "⚡️ Tadaa!")

// JSON Request
// curl --location 'localhost:4000/json' \
// --header 'Content-Type: application/json' \
// --data '{
//     "name": "oboard",
//     "age": 21
// }'
app.post("/json", event => try {
  let person : Person = event.req.body()
  HttpResponse::new(OK).body(
    "Hello, \{person.name}. You are \{person.age} years old.",
  )
} catch {
  _ => HttpResponse::new(BadRequest).body("Invalid JSON")
})

// Echo Server
app.post("/echo", e => e.req)
```
