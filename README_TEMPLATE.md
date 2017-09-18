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

console.log('connecting...');
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

console.log('connecting...');
wsp.open()
  .then(() => console.log('connected'))
  .then(() => wsp.request({foo: 'bar'}))
  .then(response => console.log('response message received', response))
  .then(() => wsp.close())
  .then(() => console.log('disconnected'));

```

## Messaging
The `.request()` method is used to send WebSocket message to the server and wait for the response.
Matching between request and response is performed by unique identifier `requestId` that should present
in both incoming and outcoming message. By default, `requestId` is auto-generated and attached to data
assuming you are sending JSON:
```js
wsp.request({foo: 'bar'})                  // actually sends {requestId: '12345', foo: 'bar'}
 .then(response => console.log(response)); // waits response from server with the same requestId: {requestId: '12345', status: 'ok'}

```
You can set `requestId` manually:
```js
wsp.request({foo: 'bar'}, {requestId: '123'});
```
If you need full control over messaging you can use `packRequest` / `unpackResponse` options. 
For example, you can use custom property `id` for unique request identifier:
```js
const wsp = new WebSocketAsPromised(url, {
  packRequest: (requestId, data) => {
    data.id = requestId;               // attach requestId as 'id'       
    return JSON.stringify(data);
  },
  unpackResponse: message => {
    const data = JSON.parse(message);
    return {requestId: data.id, data}; // read requestId from 'id' prop
  }
});

wsp.open()
  .then(() => wsp.request({foo: 'bar'}, {requestId: 1}));
```
Or send requests in **binary format**:
```js
const wsp = new WebSocketAsPromised(url, {
  packRequest: (requestId, data) => new Uint8Array([requestId, data]),
  unpackResponse: message => {
    const arr = new Uint8Array(message);
    return {requestId: arr[0], data: arr[1]};
  }
});

wsp.open()
  .then(() => wsp.request(42));
```

*Note:*  
If you want just send data and do not expect any response - use `.send()` method:
```js
wsp.send(JSON.stringify({foo: 'bar'})); // does not return promise
```

## API

{{>main}}

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[Promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
