# websocket-as-promised

[![Build Status](https://travis-ci.org/vitalets/websocket-as-promised.svg?branch=master)](https://travis-ci.org/vitalets/websocket-as-promised)
[![npm](https://img.shields.io/npm/v/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)
[![license](https://img.shields.io/npm/l/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)

> [Promise]-based [W3C WebSocket] wrapper

## Installation
```bash
npm install websocket-as-promised --save
```

## Usage in browser
```js
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised();

// connect
wsp.open('ws://echo.websocket.org')
  .then(() => console.log('Connected.'));

// send data and expect response message
wsp.request({foo: 'bar'})
  .then(response => console.log('Response message received', response));

// disconnect
wsp.close()
  .then(() => console.log('Disconnected.'));

```

## Usage in Node.js
As there is no built-in WebSocket client in Node.js, you should use a third-party module.
The most popular W3C compatible solution is [websocket](https://www.npmjs.com/package/websocket):
```js
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised({
  createWebSocket: url => new W3CWebSocket(url)
});
wsp.open('ws://echo.websocket.org')
  .then(...)

```

## API

{{>main}}

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[W3C WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise 
