# Fetch

Mocket includes an HTTP client API in `oboard/mocket/fetch`, plus the lower-level
`@mocket.fetch` function.

## Simple Request

```moonbit
fn main {
  @mocket.async_run(() => {
    try {
      let text : String = @fetch.get("https://api64.ipify.org/").read_body()
      println(text)
    } catch {
      err => println(err)
    }
  })
}
```

## Methods

The `@fetch` package exposes helpers for the standard HTTP methods:

```moonbit
fn main {
  @mocket.async_run(() => {
    let res = @fetch.post(
      "https://example.com/api",
      data=({ "name": "mocket" } : Json),
      headers={ "Content-Type": "application/json" },
    )

    let body : Json = res.read_body()
    println(body)
  })
}
```

Available helpers: `get`, `post`, `put`, `patch`, `delete`, `head`, `options`,
`trace`, and `connect`.

## Forwarding a Request

Use `@fetch.request(req)` to turn an existing `HttpRequest` into an outgoing
request.

```moonbit
app.post("/proxy", event => {
  let upstream = @fetch.request(event.req) catch {
    _ => @mocket.HttpResponse::new(BadGateway).body("Upstream request failed")
  }
  upstream
})
```
