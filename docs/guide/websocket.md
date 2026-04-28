# WebSocket

Mocket supports WebSocket connections, allowing you to build real-time applications.

## Usage

Use the `ws` method on your application instance to register a WebSocket route.

```moonbit
fn main {
  let app = @mocket.new()
  app.ws("/ws", event => match event {
    Open(peer) => println("WS open: " + peer.to_string())
    Message(peer, msg) =>
      match msg {
        Text(s) => {
          println("WS message: " + s)
          peer.text(s)
        }
        Binary(bytes) => {
          println("WS binary: " + bytes.length().to_string() + " bytes")
          peer.binary(bytes)
        }
        Ping => {
          println("WS ping")
          peer.pong()
        }
      }
    Close(peer) => println("WS close: " + peer.to_string())
  })
  println("WebSocket echo server listening on ws://localhost:8080/ws")
  app.listen("0.0.0.0:8080")
}
```

## WebSocket Events

The handler function receives a `WebSocketEvent` enum:

- `Open(WebSocketPeer)`: Triggered when a new connection is established.
- `Message(WebSocketPeer, WebSocketAggregatedMessage)`: Triggered when a message is received. The body can be `Text` or `Binary` or `Ping`.
- `Close(WebSocketPeer)`: Triggered when the connection is closed.

## WebSocketPeer

The `WebSocketPeer` struct represents a connected client and provides methods to interact with it.

### Methods

- `text(message: String)`: Sends a text message to the client.
- `binary(message: Bytes)`: Sends a binary message to the client.
- `pong()`: Sends a pong response.
- `subscribe(channel: String)`: Subscribes the client to a pub/sub channel.
- `unsubscribe(channel: String)`: Unsubscribes the client from a channel.
- `publish(channel: String, message: String)`: Publishes a message to a channel (broadcasts to all subscribers).

## Pub/Sub Example

You can use the built-in pub/sub mechanism to broadcast messages to multiple clients.

```moonbit
app.ws("/chat", event => match event {
  Open(peer) => {
    peer.subscribe("chat_room")
    @mocket.WebSocketPeer::publish("chat_room", "User joined")
  }
  Message(peer, msg) => {
    match msg {
      Text(msg) => @mocket.WebSocketPeer::publish("chat_room", msg)
      _ => ()
    }
  }
  Close(peer) => {
    peer.unsubscribe("chat_room")
  }
})
```
