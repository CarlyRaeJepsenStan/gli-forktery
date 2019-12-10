/* A Friendly WebSocket */

// WebSockets are awesome, but they have a nasty habit of disconnecting
// and not waking back up. This class is a wrapper around WebSocket that
// handles automatic reconnection

class FriendlyWebSocket {
  /
  constructor({ path = "/", url } = {}) {
    this.path = path;
    this.url = url;
    this.connect();
    this.connected = false;
    this._listeners = {
      message: new Set()
    };
  }

  connect() {
    let protocol = 'ws://';
    if (location.protocol === 'https:') {
      protocol = 'wss://';
    }
    
    this.socket = new WebSocket(protocol + location.host + this.path);

    // Connection opened
    this.socket.addEventListener("open", event => {
      console.log("connected!");
      this.connected = true;
      // this isn't necessary, but it's polite to say hi!
      this.socket.send("Hello Server!");
    });

    this.socket.addEventListener("close", event => {
      console.log("disconnected");
      this.connected = false;
      // the server went away, try re-connecting in 2 seconds.
      setTimeout(() => this.connect(), 2000);
    });

    // Listen for messages
    this.socket.addEventListener("message", event => {
      // tell the listeners about it
      this._listeners.message.forEach(handler => {
        // don't let one listener spoil the batch
        try {
          handler(event.data);
        } catch (e) {
          console.warn("error in message handler", e);
        }
      });
    });
  }

  on(type, handler) {
    if (type in this._listeners) {
      this._listeners[type].add(handler);
    }
  }

  off(type, handler) {
    if (type === "message") {
      this.messageHandlers.delete(handler);
    }
  }

  send(message) {
    if (this.connected) {
      this.socket.send(message);
    }
  }
}
