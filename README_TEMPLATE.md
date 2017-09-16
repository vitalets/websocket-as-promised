# websocket-as-promised

[![Build Status](https://travis-ci.org/vitalets/websocket-as-promised.svg?branch=master)](https://travis-ci.org/vitalets/websocket-as-promised)
[![npm](https://img.shields.io/npm/v/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)
[![license](https://img.shields.io/npm/l/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)

> Promise-based W3C WebSocket client

A [WebSocket] client library that allows to use [Promises] for connecting, disconnecting and messaging with server.

## Installation
```bash
npm install websocket-as-promised --save
```

## Usage in browser
```js
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised('ws://echo.websocket.org');

wsp.open()
  .then(() => console.log('connected'))
  .then(() => wsp.request({foo: 'bar'}))
  .then(response => console.log('response message received', response))
  .then(() => wsp.close())
  .then(() => console.log('disconnected'));

```

## Usage in Node.js
As there is no built-in WebSocket client in Node.js, you should use a third-party module.
For example [websocket](https://www.npmjs.com/package/websocket) package:
```js
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised('ws://echo.websocket.org', {
  createWebSocket: url => new W3CWebSocket(url) // custom WebSocket constructor
});

wsp.open()
  .then(() => console.log('connected'))
  .then(() => wsp.request({foo: 'bar'}))
  .then(response => console.log('response message received', response))
  .then(() => wsp.close())
  .then(() => console.log('disconnected'));

```

## Messaging
1. if you want to send message and expect server's response - you should use `.request()` method that returns promise:
    ```js
    wsp.request({foo: 'bar'})
     .then(response => console.log(response));
    // actually sends message with unique requestId: {requestId: 'xxxxx', foo: 'bar'}
    // and waits response from server with the same requestId: {requestId: 'xxxxx', response: 'ok'}
    ```

2. if you want to just send data and do not expect any response - use `.send()` method:
    ```js
    wsp.send(JSON.stringify({foo: 'bar'})); // does not return promise
    ```

## API

{{>main}}

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[Promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
