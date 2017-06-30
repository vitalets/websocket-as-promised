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
wsp.open('ws://echo.websocket.org')
  .then(() => wsp.send({foo: 'bar'}))
  .then(response => console.log(response.id))
  .then(() => wsp.close())
  .catch(e => console.error(e));

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

<a name="WebSocketAsPromised"></a>

## WebSocketAsPromised
**Kind**: global class  

* [WebSocketAsPromised](#WebSocketAsPromised)
    * [new WebSocketAsPromised([options])](#new_WebSocketAsPromised_new)
    * [.ws](#WebSocketAsPromised+ws) ⇒ <code>WebSocket</code>
    * [.onMessage](#WebSocketAsPromised+onMessage) ⇒ <code>Channel</code>
    * [.open(url)](#WebSocketAsPromised+open) ⇒ <code>Promise</code>
    * [.request(data, [options])](#WebSocketAsPromised+request) ⇒ <code>Promise</code>
    * [.send(data)](#WebSocketAsPromised+send)
    * [.close()](#WebSocketAsPromised+close) ⇒ <code>Promise</code>

<a name="new_WebSocketAsPromised_new"></a>

### new WebSocketAsPromised([options])
Constructor


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> |  |  |
| [options.createWebSocket] | <code>function</code> | <code>url =&gt; new Websocket(url)</code> | custom WebSocket creation method |
| [options.idProp] | <code>String</code> | <code>&quot;id&quot;</code> | id property name attached to each message |
| [options.timeout] | <code>Number</code> | <code>0</code> | default timeout for requests |

<a name="WebSocketAsPromised+ws"></a>

### wsp.ws ⇒ <code>WebSocket</code>
Returns original WebSocket instance created by `options.createWebSocket`.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+onMessage"></a>

### wsp.onMessage ⇒ <code>Channel</code>
OnMessage channel with `.addListener` / `.removeListener` methods.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://github.com/vitalets/chnl  
<a name="WebSocketAsPromised+open"></a>

### wsp.open(url) ⇒ <code>Promise</code>
Opens WebSocket connection.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| url | <code>String</code> | 

<a name="WebSocketAsPromised+request"></a>

### wsp.request(data, [options]) ⇒ <code>Promise</code>
Performs JSON request and waits for response.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 
| [options] | <code>Object</code> | 
| [options.timeout] | <code>Number</code> | 

<a name="WebSocketAsPromised+send"></a>

### wsp.send(data)
Performs JSON request and does not wait for response.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

<a name="WebSocketAsPromised+close"></a>

### wsp.close() ⇒ <code>Promise</code>
Closes WebSocket connection.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[W3C WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise 
