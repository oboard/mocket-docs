# Static Assets

Mocket can serve static files through `Mocket::static_assets`. The built-in
`oboard/mocket/static_file` package provides a filesystem-backed provider.

## Usage

```moonbit
async fn main {
  let app = @mocket.new()

  app.static_assets("/", @static_file.new("./public"))
  app.get("/", _ => "Hello, Mocket!")

  app.listen("0.0.0.0:4000")
}
```

Requests under the registered path are resolved by the provider. The built-in
static file provider looks for common index files such as `index.html`,
`index.htm`, `index.json`, and `index.md`.

## Custom Provider

Implement `ServeStaticProvider` when assets come from memory, a database, or a
custom bundle.

```moonbit
trait ServeStaticProvider {
  get_meta(Self, String) -> StaticAssetMeta?
  get_contents(Self, String) -> &Responder
  get_type(Self, String) -> String?
  get_encodings(Self) -> Map[String, String]
  get_index_names(Self) -> Array[String]
  get_fallthrough(Self) -> Bool
}
```

`get_fallthrough()` controls whether Mocket should continue to later middleware
when the asset is missing or the method is not `GET` or `HEAD`.
