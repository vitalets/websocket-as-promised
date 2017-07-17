# websocket-as-promised

[![Build Status](https://travis-ci.org/vitalets/websocket-as-promised.svg?branch=master)](https://travis-ci.org/vitalets/websocket-as-promised)
[![npm](https://img.shields.io/npm/v/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)
[![license](https://img.shields.io/npm/l/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)

> Promise-based W3C WebSocket wrapper

This library allows to use [Promises] when connecting, disconnecting and messaging with [WebSocket] server.

## Installation
```bash
npm install websocket-as-promised --save
```

## Usage in browser
```js
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised('ws://echo.websocket.org');

wsp.open()
  .then(() => console.log('Opened.'))
  .then(() => wsp.request({foo: 'bar'}))
  .then(response => console.log('Response message received', response))
  .then(() => wsp.close())
  .then(() => console.log('Closed.'));

```

## Usage in Node.js
As there is no built-in WebSocket client in Node.js, you should use a third-party module.
The most popular W3C compatible solution is [websocket](https://www.npmjs.com/package/websocket):
```js
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised('ws://echo.websocket.org', {
  createWebSocket: url => new W3CWebSocket(url)
});

wsp.open()
  .then(() => console.log('Opened.'));
  ...

```

## Messaging
1. if you want to send message and expect server's response - you should use `.request()` method that returns promise:
    ```js
    wsp.request({foo: 'bar'}); // returns promise
    // actually sends message with unique id: {id: 'xxxxx', foo: 'bar'}
    // promise waits response message with the same id: {id: 'xxxxx', response: 'ok'}
    ```

2. if you want to just send data and do not expect any response - use `.sendJson() / .send()` methods:
    ```js
    wsp.sendJson({foo: 'bar'}); // does not return promise
    ```

## API

<a name="WebSocketAsPromised"></a>

## WebSocketAsPromised
**Kind**: global class  

* [WebSocketAsPromised](#WebSocketAsPromised)
    * [new WebSocketAsPromised(url, [options])](#new_WebSocketAsPromised_new)
    * [.ws](#WebSocketAsPromised+ws) ⇒ <code>WebSocket</code>
    * [.isOpening](#WebSocketAsPromised+isOpening) ⇒ <code>Boolean</code>
    * [.isOpened](#WebSocketAsPromised+isOpened) ⇒ <code>Boolean</code>
    * [.isClosing](#WebSocketAsPromised+isClosing) ⇒ <code>Boolean</code>
    * [.isClosed](#WebSocketAsPromised+isClosed) ⇒ <code>Boolean</code>
    * [.onMessage](#WebSocketAsPromised+onMessage) ⇒ <code>Channel</code>
    * [.open()](#WebSocketAsPromised+open) ⇒ <code>Promise</code>
    * [.request(data, [options])](#WebSocketAsPromised+request) ⇒ <code>Promise</code>
    * [.sendJson(data)](#WebSocketAsPromised+sendJson)
    * [.send(data)](#WebSocketAsPromised+send)
    * [.close()](#WebSocketAsPromised+close) ⇒ <code>Promise</code>

<a name="new_WebSocketAsPromised_new"></a>

### new WebSocketAsPromised(url, [options])
Constructor. Instead of original WebSocket it does not immediately open connection.
Please call `open()` method manually to connect.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>String</code> |  | WebSocket URL |
| [options] | <code>Object</code> |  |  |
| [options.createWebSocket] | <code>function</code> | <code>url =&gt; new Websocket(url)</code> | custom WebSocket creation method |
| [options.idProp] | <code>String</code> | <code>&quot;id&quot;</code> | id property name attached to each message |
| [options.timeout] | <code>Number</code> | <code>0</code> | default timeout for requests |

<a name="WebSocketAsPromised+ws"></a>

### wsp.ws ⇒ <code>WebSocket</code>
Returns original WebSocket instance created by `options.createWebSocket`.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isOpening"></a>

### wsp.isOpening ⇒ <code>Boolean</code>
Is WebSocket in opening state.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isOpened"></a>

### wsp.isOpened ⇒ <code>Boolean</code>
Is WebSocket opened.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isClosing"></a>

### wsp.isClosing ⇒ <code>Boolean</code>
Is WebSocket in closing state.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isClosed"></a>

### wsp.isClosed ⇒ <code>Boolean</code>
Is WebSocket closed.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+onMessage"></a>

### wsp.onMessage ⇒ <code>Channel</code>
OnMessage channel with `.addListener` / `.removeListener` methods.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
<a name="WebSocketAsPromised+open"></a>

### wsp.open() ⇒ <code>Promise</code>
Opens WebSocket connection.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+request"></a>

### wsp.request(data, [options]) ⇒ <code>Promise</code>
Performs JSON request and waits for response.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 
| [options] | <code>Object</code> | 
| [options.timeout] | <code>Number</code> | 

<a name="WebSocketAsPromised+sendJson"></a>

### wsp.sendJson(data)
Sends JSON data and does not wait for response.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

<a name="WebSocketAsPromised+send"></a>

### wsp.send(data)
Sends any WebSocket compatible data.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>String</code> \| <code>ArrayBuffer</code> \| <code>Blob</code> | 

<a name="WebSocketAsPromised+close"></a>

### wsp.close() ⇒ <code>Promise</code>
Closes WebSocket connection.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[Promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
