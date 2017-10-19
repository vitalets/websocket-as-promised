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
wsp.request({foo: 'bar'})                  // actually sends {foo: 'bar', requestId: 'xxx'}
 .then(response => console.log(response)); // waits response from server with the same requestId: {requestId: 'xxx', status: 'ok'}

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
  unpackResponse: rawData => {
    const data = JSON.parse(rawData);
    return {requestId: data.id, data}; // read requestId from 'id' prop
  }
});

wsp.open()
  .then(() => wsp.request({foo: 'bar'}));
```
Or send requests in **binary format**:
```js
const wsp = new WebSocketAsPromised(url, {
  packRequest: (requestId, data) => new Uint8Array([requestId, data]),
  unpackResponse: rawData => {
    const arr = new Uint8Array(rawData);
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
    * [.open()](#WebSocketAsPromised+open) ⇒ <code>Promise.&lt;Event&gt;</code>
    * [.request(data, [options])](#WebSocketAsPromised+request) ⇒ <code>Promise</code>
    * [.send(rawData)](#WebSocketAsPromised+send)
    * [.close()](#WebSocketAsPromised+close) ⇒ <code>Promise.&lt;Event&gt;</code>

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
1. `rawData` from `event.data`
2. `unpackedData` if unpack succeeded

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onMessage.addListener((rawData, unpackedData) => console.log(unpackedData));
```
<a name="WebSocketAsPromised+onClose"></a>

### wsp.onClose ⇒ <code>Channel</code>
Event channel triggered when connection closed.
Listener accepts single argument `{code, reason}`.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
<a name="WebSocketAsPromised+open"></a>

### wsp.open() ⇒ <code>Promise.&lt;Event&gt;</code>
Opens WebSocket connection. If connection already opened, promise will be resolved with "open event".

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+request"></a>

### wsp.request(data, [options]) ⇒ <code>Promise</code>
Performs request and waits for response.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type | Default |
| --- | --- | --- |
| data | <code>Object</code> |  | 
| [options] | <code>Object</code> |  | 
| [options.requestId] | <code>String</code> \| <code>Number</code> | <code>&lt;auto-generated&gt;</code> | 
| [options.requestIdPrefix] | <code>String</code> | <code>&quot;&quot;</code> | 
| [options.timeout] | <code>Number</code> | <code>0</code> | 

<a name="WebSocketAsPromised+send"></a>

### wsp.send(rawData)
Sends any data by WebSocket.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| rawData | <code>String</code> \| <code>ArrayBuffer</code> \| <code>Blob</code> | 

<a name="WebSocketAsPromised+close"></a>

### wsp.close() ⇒ <code>Promise.&lt;Event&gt;</code>
Closes WebSocket connection. If connection already closed, promise will be resolved with "close event".

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
| timeout | <code>Number</code> | <code>0</code> | timeout for opening connection and sending messages |
| connectionTimeout | <code>Number</code> | <code>0</code> | special timeout for opening connection (defaults to `timeout`) |


## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[Promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
