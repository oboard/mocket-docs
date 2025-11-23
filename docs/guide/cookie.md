# Cookies

Mocket provides methods to read and write cookies in your handlers.

## Usage

### Setting Cookies

Use `res.set_cookie` to set a cookie on the response.

```moonbit
app.get("/login", event => {
  event.res.set_cookie("session_id", "12345", max_age=3600, http_only=true)
  Text("Logged in")
})
```

### Getting Cookies

Use `req.get_cookie` to retrieve a cookie from the request.

```moonbit
app.get("/dashboard", event => {
  match event.req.get_cookie("session_id") {
    Some(cookie) => Text("Session ID: " + cookie.value)
    None => Text("Not logged in")
  }
})
```

### Deleting Cookies

Use `res.delete_cookie` to delete a cookie (by setting its expiration date to the past).

```moonbit
app.get("/logout", event => {
  event.res.delete_cookie("session_id")
  Text("Logged out")
})
```

## API Reference

### `HttpResponse::set_cookie`

```moonbit
pub fn set_cookie(
  self : HttpResponse,
  name : String,
  value : String,
  max_age? : Int,
  path? : String,
  domain? : String,
  secure? : Bool,
  http_only? : Bool,
  same_site? : SameSiteOption,
) -> Unit
```

- `name`: The name of the cookie.
- `value`: The value of the cookie.
- `max_age`: Max age in seconds.
- `path`: The path for the cookie.
- `domain`: The domain for the cookie.
- `secure`: If true, the cookie is only sent over HTTPS.
- `http_only`: If true, the cookie is not accessible via JavaScript.
- `same_site`: Controls the `SameSite` attribute (`Lax`, `Strict`, or `None`).

### `HttpRequest::get_cookie`

```moonbit
pub fn get_cookie(self : HttpRequest, name : String) -> CookieItem?
```

Returns `Some(CookieItem)` if the cookie exists, or `None`.

### `CookieItem`

The `CookieItem` struct contains the details of a cookie:

```moonbit
pub struct CookieItem {
  name : String
  value : String
  max_age : Int?
  path : String?
  domain : String?
  secure : Bool?
  http_only : Bool?
  same_site : SameSiteOption?
}
```
