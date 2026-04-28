# Body Reader Guide

Body reader is Mocket’s unified request body protocol. Route handlers and middlewares read the request body using `HttpRequest::body()`. The runtime uses it to deserialize the body into a type.

## Body Reader Trait
```moonbit
trait BodyReader {
  from_request(HttpRequest) -> Self raise
}
```

Common constructs:

- Text: return `String`.
- JSON: return `Json`.
- Binary: return `Bytes`, `Array[Byte]`, or `FixedArray[Byte]`.

## Custom Body Reader

Implement `BodyReader` for your own type to control deserialization, e.g., CSV:

```moonbit
struct Csv(String)

impl @mocket.BodyReader for Csv with from_request(req) -> Csv {
  let text : String = req.body()
  Csv(text)
}

app.post("/upload", event => {
  let csv : Csv = event.req.body() catch { _ => Csv("") }
  @mocket.HttpResponse::new(OK).body(csv.0)
})
```
