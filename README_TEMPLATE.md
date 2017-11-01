<h1 align="center">websocket-as-promised</h1>
<h5 align="center">A
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API">WebSocket</a> 
client library providing 
<a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>-based API
for connecting, disconnecting and messaging with server</h5>
<div align="center">
  <a href="https://travis-ci.org/vitalets/websocket-as-promised"><img src="https://travis-ci.org/vitalets/websocket-as-promised.svg?branch=master" alt="Build Status" /></a>
  <a href="https://www.npmjs.com/package/websocket-as-promised"><img src="https://img.shields.io/npm/v/websocket-as-promised.svg" alt="Npm version" /></a>
  <a href="https://www.npmjs.com/package/websocket-as-promised"><img src="https://img.shields.io/npm/l/websocket-as-promised.svg" alt="License" /></a>
</div>

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
import WebSocketAsPromised from 'websocket-as-promised';

const wsp = new WebSocketAsPromised(wsUrl);

wsp.open()
  .then(() => wsp.send('foo'))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```
Or with ES7 [async / await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function):
```js
import WebSocketAsPromised from 'websocket-as-promised';

const wsp = new WebSocketAsPromised(wsUrl);

(async () => {
  try {
    await wsp.open();
    wsp.send('foo');
  } catch(e) {
    console.error(e);
  } finally {
    await wsp.close();
  }
})();
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
*websocket-as-promised* supports simple request-response mechanism. 
Method `.sendRequest()` sends message with unique `requestId` and returns promise. 
That promise get resolved when response message with the same `requestId` comes. 
For setting/reading `requestId` from messages there are two functions `options.attachRequestId / options.extractRequestId`:
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

> Note: you should implement yourself attaching `requestId` on server side.

## API

{{>main}}

## Changelog
Please see [CHANGELOG.md](CHANGELOG.md).

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
