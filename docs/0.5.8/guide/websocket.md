# WebSocket (0.5.8)

Mocket supports WebSocket connections, allowing you to build real-time applications.

## Usage

Use the `ws` method on your application instance to register a WebSocket route.

```moonbit
let app = @mocket.new()

app.ws("/ws", event => match event {
  Open(peer) => println("Client connected: " + peer.to_string())
  Message(peer, body) => {
    match body {
      Text(msg) => {
        println("Received: " + msg)
        peer.send("Echo: " + msg)
      }
      _ => ()
    }
  }
  Close(peer) => println("Client disconnected: " + peer.to_string())
})

app.serve(port=8080)
```

## WebSocket Events

The handler function receives a `WebSocketEvent` enum:

- `Open(WebSocketPeer)`: Triggered when a new connection is established.
- `Message(WebSocketPeer, HttpBody)`: Triggered when a message is received. The body can be `Text` or other types.
- `Close(WebSocketPeer)`: Triggered when the connection is closed.

## WebSocketPeer

The `WebSocketPeer` struct represents a connected client and provides methods to interact with it.

### Methods

- `send(message: String)`: Sends a text message to the client.
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
  Message(peer, body) => {
    match body {
      Text(msg) => @mocket.WebSocketPeer::publish("chat_room", msg)
      _ => ()
    }
  }
  Close(peer) => {
    peer.unsubscribe("chat_room")
  }
})
```

