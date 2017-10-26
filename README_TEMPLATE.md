# websocket-as-promised

[![Build Status](https://travis-ci.org/vitalets/websocket-as-promised.svg?branch=master)](https://travis-ci.org/vitalets/websocket-as-promised)
[![npm](https://img.shields.io/npm/v/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)
[![license](https://img.shields.io/npm/l/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)

> Promise-based API for WebSockets

A [WebSocket] client library providing [Promise]-based API for connecting, disconnecting and messaging with server.

## Contents
* [Installation](#installation)
* [Usage](#usage-in-browser)
  * [Browser](#usage-in-browser)
  * [Node.js](#usage-in-nodejs)
* [Sending data](#sending-raw-data)
  * [Raw](#sending-raw-data)
  * [JSON](#sending-json)
  * [Binary](#sending-binary)
  * [Requests](#sending-requests)
* [API](#api)
* [Changelog](#changelog)
* [License](#license)

## Installation
```bash
npm install websocket-as-promised --save
```

## Usage in browser
```js
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised(wsUrl);

wsp.open()
  .then(() => wsp.send('foo'))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```

## Usage in Node.js
As there is no built-in WebSocket client in Node.js, you should use a third-party module
(for example [websocket](https://www.npmjs.com/package/websocket)):
```js
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised(wsUrl, {
  createWebSocket: url => new W3CWebSocket(url)
});

wsp.open()
  .then(() => wsp.send('foo'))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```

## Sending raw data
To send raw data use `.send()` method:
```js
wsp.send('foo');
```
To handle raw messages from server use `.onMessage` channel:
```js
wsp.onMessage.addListener(message => console.log(message));
```

## Sending JSON
To send JSON you should define `options.packMessage / options.unpackMessage` and use `.sendPacked()` method:
```js
const wsp = new WebSocketAsPromised(wsUrl, {
  packMessage: data => JSON.strinigfy(data),
  unpackMessage: message => JSON.parse(message)
});

wsp.open()
  .then(() => wsp.sendPacked({foo: 'bar'}))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```
You can also subscribe to receiving packed message:
```js
wsp.onPackedMessage.addListener(data => console.log(data));
```

## Sending binary
Example of sending `Uint8Array`:
```js
const wsp = new WebSocketAsPromised(wsUrl, {
    packMessage: data => (new Uint8Array(data)).buffer,
    unpackMessage: message => new Uint8Array(message),
});

wsp.open()
  .then(() => wsp.sendPacked([1, 2, 3]))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```

## Sending requests
Sending request assumes sending WebSocket message that waits for server response. 
Method `.sendRequest()` returns promise that resolves when response comes. 
Match between request and response is performed by **unique request identifier**
that should present in both sent and received messages. 
For setting/reading `requestId` there are two functions `options.attachRequestId / options.extractRequestId`:
```js
const wsp = new WebSocketAsPromised(wsUrl, {
  packMessage: data => JSON.strinigfy(data),
  unpackMessage: message => JSON.parse(message),
  attachRequestId: (data, requestId) => Object.assign({id: requestId}, data), // attach requestId to message as `id` field
  extractRequestId: data => data && data.id,                                  // read requestId from message `id` field
});

wsp.open()
 .then(() => wsp.sendRequest({foo: 'bar'})) // actually sends {foo: 'bar', id: 'xxx'}
 .then(response => console.log(response));  // waits server message with corresponding requestId: {id: 'xxx', ...}
```
By default `requestId` value is auto-generated, but you can set it manually:
```js
wsp.sendRequest({foo: 'bar'}, {requestId: 42});
```

## API

{{>main}}

## Changelog
Please see [CHANGELOG.md](CHANGELOG.md).

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
