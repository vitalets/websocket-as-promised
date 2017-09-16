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

## Classes

<dl>
<dt><a href="#WebSocketAsPromised">WebSocketAsPromised</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Options">Options</a> : <code>Object</code></dt>
<dd></dd>
</dl>

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
    * [.onClose](#WebSocketAsPromised+onClose) ⇒ <code>Channel</code>
    * [.open()](#WebSocketAsPromised+open) ⇒ <code>Promise</code>
    * [.request(data, [options])](#WebSocketAsPromised+request) ⇒ <code>Promise</code>
    * [.send(data)](#WebSocketAsPromised+send)
    * [.close()](#WebSocketAsPromised+close) ⇒ <code>Promise</code>

<a name="new_WebSocketAsPromised_new"></a>

### new WebSocketAsPromised(url, [options])
Constructor. Unlike original WebSocket it does not immediately open connection.
Please call `open()` method manually to connect.


| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | WebSocket URL |
| [options] | [<code>Options</code>](#Options) |  |

<a name="WebSocketAsPromised+ws"></a>

### wsp.ws ⇒ <code>WebSocket</code>
Returns original WebSocket instance created by `options.createWebSocket`.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isOpening"></a>

### wsp.isOpening ⇒ <code>Boolean</code>
Is WebSocket connection in opening state.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isOpened"></a>

### wsp.isOpened ⇒ <code>Boolean</code>
Is WebSocket connection opened.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isClosing"></a>

### wsp.isClosing ⇒ <code>Boolean</code>
Is WebSocket connection in closing state.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isClosed"></a>

### wsp.isClosed ⇒ <code>Boolean</code>
Is WebSocket connection closed.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+onMessage"></a>

### wsp.onMessage ⇒ <code>Channel</code>
Event channel triggered every time when message from server arrives.
Listener accepts two arguments:
1. `jsonData` if JSON parse succeeded
2. original `event.data`

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onMessage.addListener((data, jsonData) => console.log(data, jsonData));
```
<a name="WebSocketAsPromised+onClose"></a>

### wsp.onClose ⇒ <code>Channel</code>
Event channel triggered when connection closed.
Listener accepts single argument `{code, reason}`.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
<a name="WebSocketAsPromised+open"></a>

### wsp.open() ⇒ <code>Promise</code>
Opens WebSocket connection.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+request"></a>

### wsp.request(data, [options]) ⇒ <code>Promise</code>
Performs request and waits for response.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type | Default |
| --- | --- | --- |
| data | <code>Object</code> |  | 
| [options] | <code>Object</code> |  | 
| [options.requestId] | <code>String</code> | <code>&lt;auto-generated&gt;</code> | 
| [options.requestIdPrefix] | <code>String</code> | <code>&quot;&quot;</code> | 
| [options.timeout] | <code>Number</code> | <code>0</code> | 

<a name="WebSocketAsPromised+send"></a>

### wsp.send(data)
Sends any data by WebSocket.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>String</code> \| <code>ArrayBuffer</code> \| <code>Blob</code> | 

<a name="WebSocketAsPromised+close"></a>

### wsp.close() ⇒ <code>Promise</code>
Closes WebSocket connection.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="Options"></a>

## Options : <code>Object</code>
**Kind**: global typedef  
**Defaults**: please see [options.js](https://github.com/vitalets/websocket-as-promised/blob/master/src/options.js)
for default values  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| createWebSocket | <code>function</code> |  | custom WebSocket creation function |
| packRequest | <code>function</code> |  | custom packing request function |
| unpackResponse | <code>function</code> |  | custom unpacking response function |
| timeout | <code>Number</code> | <code>0</code> | default timeout for requests |


## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[Promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
