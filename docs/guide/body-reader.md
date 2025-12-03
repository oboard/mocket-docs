# Body Reader Guide

Body reader is Mocket’s unified request body protocol. Route handlers and middlewares read the request body using `HttpRequest::body()`. The runtime uses it to deserialize the body into a type.

## Body Reader Trait
```moonbit
trait BodyReader {
  read(Self, buf: @buffer.Buffer) -> Unit
}
```

Common constructs:

- Text: return `String` / `StringView`.
- JSON: return `Json`.
- Binary: return `Bytes`.

## Custom Body Reader

Implement `BodyReader` for your own type to control deserialization, e.g., CSV:

```moonbit
struct Csv(String)

impl @mocket.BodyReader for Csv with from_request(req) -> Csv raise {
  let text: String = req.body()
  Csv(text)
}

let csv: Csv = event.req.body()
```
