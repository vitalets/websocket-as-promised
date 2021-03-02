# websocket-as-promised

<img alt="websocket-as-promised logo" align="right" src="https://user-images.githubusercontent.com/1473072/32486445-b2443538-c3b7-11e7-8e9f-94c95efad760.png"/>

[![Actions Status](https://github.com/vitalets/websocket-as-promised/workflows/autotests/badge.svg)](https://github.com/vitalets/websocket-as-promised/actions)
[![Known Vulnerabilities](https://snyk.io/test/github/vitalets/websocket-as-promised/badge.svg?targetFile=package.json)](https://snyk.io/test/github/vitalets/websocket-as-promised?targetFile=package.json)
[![npm](https://img.shields.io/npm/v/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)
[![license](https://img.shields.io/npm/l/websocket-as-promised.svg)](https://www.npmjs.com/package/websocket-as-promised)

A [WebSocket] client library with [Promise]-based API for browser and Node.js.

## Example
```js
import WebSocketAsPromised from 'websocket-as-promised';

// create instance of WebSocket connection
const wsp = new WebSocketAsPromised('ws://example.com');

// wait for WebSocket connection to open
await wsp.open();

// send some data
wsp.send('data');

// wait for connection to close
await wsp.close();
```

## Contents
* [Requirements](#requirements)
* [Installation](#installation)
* [Usage](#usage-in-browser)
  * [Browser](#usage-in-browser)
  * [Node.js](#usage-in-nodejs)
* [Sending data](#sending-raw-data)
  * [raw](#sending-raw-data)
  * [JSON](#sending-json)
  * [binary](#sending-binary)
  * [request / response](#sending-requests)
* [API](#api)
* [Changelog](#changelog)
* [License](#license)

## Requirements
* global `Promise` constructor

## Installation
```bash
npm i websocket-as-promised --save
```

## Usage in browser
```js
import WebSocketAsPromised from 'websocket-as-promised';

const wsp = new WebSocketAsPromised('ws://example.com');

wsp.open()
  .then(() => wsp.send('message'))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```
Or with ES7 [async / await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function):
```js
import WebSocketAsPromised from 'websocket-as-promised';

const wsp = new WebSocketAsPromised('ws://example.com');

(async () => {
  try {
    await wsp.open();
    wsp.send('message');
  } catch(e) {
    console.error(e);
  } finally {
    await wsp.close();
  }
})();
```

## Usage in Node.js
As there is no built-in WebSocket client in Node.js, you should use a third-party WebSocket npm package.

### Usage with [websocket](https://www.npmjs.com/package/websocket)
Here you should use W3C compatible client - [W3CWebSocket](https://github.com/theturtle32/WebSocket-Node/blob/master/docs/W3CWebSocket.md):
```js
const WebSocketAsPromised = require('websocket-as-promised');
const W3CWebSocket = require('websocket').w3cwebsocket;

const wsp = new WebSocketAsPromised('ws://example.com', {
  createWebSocket: url => new W3CWebSocket(url)
});

wsp.open()
  .then(() => wsp.send('message'))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```

### Usage with [ws](https://www.npmjs.com/package/ws)
Here it is important to define `extractMessageData` option as event data are passed directly to `onmessage` handler, 
not as `event.data` by [spec](https://html.spec.whatwg.org/multipage/comms.html#dom-messageevent-data):
```js
const WebSocketAsPromised = require('websocket-as-promised');
const WebSocket = require('ws');

const wsp = new WebSocketAsPromised('ws://example.com', {
  createWebSocket: url => new WebSocket(url),
  extractMessageData: event => event, // <- this is important
});

wsp.open()
  .then(() => wsp.send('message'))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```

## Sending raw data
To send raw data use `.send()` method:
```js
wsp.send('foo');
```
To handle raw data from server use `.onMessage` channel:
```js
wsp.onMessage.addListener(data => console.log(data));
```

## Sending JSON
To send JSON you should define `packMessage / unpackMessage` options:
```js
const wsp = new WebSocketAsPromised(wsUrl, {
  packMessage: data => JSON.stringify(data),
  unpackMessage: data => JSON.parse(data)
});
```
To send data use `.sendPacked()` method passing json as parameter:
```js
wsp.sendPacked({foo: 'bar'});
```
To read unpacked data from received message you can subscribe to `onUnpackedMessage` channel:
```js
wsp.onUnpackedMessage.addListener(data => console.log(data.status));
```

## Sending binary
Example of sending `Uint8Array`:
```js
const wsp = new WebSocketAsPromised(wsUrl, {
    packMessage: data => (new Uint8Array(data)).buffer,
    unpackMessage: data => new Uint8Array(data),
});

wsp.open()
  .then(() => wsp.sendPacked([1, 2, 3]))
  .then(() => wsp.close())
  .catch(e => console.error(e));
```

## Sending requests
*websocket-as-promised* provides simple request-response mechanism ([JSON RPC](https://www.jsonrpc.org)). 
Method `.sendRequest()` sends message with unique `requestId` and returns promise. 
That promise get resolved when response message with the same `requestId` comes. 
For reading/setting `requestId` from/to message there are two functions defined in options `attachRequestId / extractRequestId`:
```js
const wsp = new WebSocketAsPromised(wsUrl, {
  packMessage: data => JSON.stringify(data),
  unpackMessage: data => JSON.parse(data),
  attachRequestId: (data, requestId) => Object.assign({id: requestId}, data), // attach requestId to message as `id` field
  extractRequestId: data => data && data.id,                                  // read requestId from message `id` field
});

wsp.open()
 .then(() => wsp.sendRequest({foo: 'bar'})) // actually sends {foo: 'bar', id: 'xxx'}, because `attachRequestId` defined above
 .then(response => console.log(response));  // waits server message with corresponding requestId: {id: 'xxx', ...}
```
By default `requestId` value is auto-generated, but you can set it manually:
```js
wsp.sendRequest({foo: 'bar'}, {requestId: 42});
```

> Note: you should implement yourself attaching `requestId` on server side.

## API

### Classes

<dl>
<dt><a href="#WebSocketAsPromised">WebSocketAsPromised</a></dt>
<dd></dd>
</dl>

### Typedefs

<dl>
<dt><a href="#Options">Options</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="WebSocketAsPromised"></a>

### WebSocketAsPromised
**Kind**: global class  

* [WebSocketAsPromised](#WebSocketAsPromised)
    * [new WebSocketAsPromised(url, [options])](#new_WebSocketAsPromised_new)
    * [.ws](#WebSocketAsPromised+ws) ⇒ <code>WebSocket</code>
    * [.url](#WebSocketAsPromised+url) ⇒ <code>String</code>
    * [.isOpening](#WebSocketAsPromised+isOpening) ⇒ <code>Boolean</code>
    * [.isOpened](#WebSocketAsPromised+isOpened) ⇒ <code>Boolean</code>
    * [.isClosing](#WebSocketAsPromised+isClosing) ⇒ <code>Boolean</code>
    * [.isClosed](#WebSocketAsPromised+isClosed) ⇒ <code>Boolean</code>
    * [.onOpen](#WebSocketAsPromised+onOpen) ⇒ <code>Channel</code>
    * [.onSend](#WebSocketAsPromised+onSend) ⇒ <code>Channel</code>
    * [.onMessage](#WebSocketAsPromised+onMessage) ⇒ <code>Channel</code>
    * [.onUnpackedMessage](#WebSocketAsPromised+onUnpackedMessage) ⇒ <code>Channel</code>
    * [.onResponse](#WebSocketAsPromised+onResponse) ⇒ <code>Channel</code>
    * [.onClose](#WebSocketAsPromised+onClose) ⇒ <code>Channel</code>
    * [.onError](#WebSocketAsPromised+onError) ⇒ <code>Channel</code>
    * [.open()](#WebSocketAsPromised+open) ⇒ <code>Promise.&lt;Event&gt;</code>
    * [.sendRequest(data, [options])](#WebSocketAsPromised+sendRequest) ⇒ <code>Promise</code>
    * [.sendPacked(data)](#WebSocketAsPromised+sendPacked)
    * [.send(data)](#WebSocketAsPromised+send)
    * [.waitUnpackedMessage(predicate, [options])](#WebSocketAsPromised+waitUnpackedMessage) ⇒ <code>Promise</code>
    * [.close([code], [reason])](#WebSocketAsPromised+close) ⇒ <code>Promise.&lt;Event&gt;</code>
    * [.removeAllListeners()](#WebSocketAsPromised+removeAllListeners)

<a name="new_WebSocketAsPromised_new"></a>

#### new WebSocketAsPromised(url, [options])
Constructor. Unlike original WebSocket it does not immediately open connection.
Please call `open()` method to connect.


| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | WebSocket URL |
| [options] | [<code>Options</code>](#Options) |  |

<a name="WebSocketAsPromised+ws"></a>

#### wsp.ws ⇒ <code>WebSocket</code>
Returns original WebSocket instance created by `options.createWebSocket`.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+url"></a>

#### wsp.url ⇒ <code>String</code>
Returns WebSocket url.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isOpening"></a>

#### wsp.isOpening ⇒ <code>Boolean</code>
Is WebSocket connection in opening state.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isOpened"></a>

#### wsp.isOpened ⇒ <code>Boolean</code>
Is WebSocket connection opened.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isClosing"></a>

#### wsp.isClosing ⇒ <code>Boolean</code>
Is WebSocket connection in closing state.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+isClosed"></a>

#### wsp.isClosed ⇒ <code>Boolean</code>
Is WebSocket connection closed.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+onOpen"></a>

#### wsp.onOpen ⇒ <code>Channel</code>
Event channel triggered when connection is opened.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onOpen.addListener(() => console.log('Connection opened'));
```
<a name="WebSocketAsPromised+onSend"></a>

#### wsp.onSend ⇒ <code>Channel</code>
Event channel triggered every time when message is sent to server.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onSend.addListener(data => console.log('Message sent', data));
```
<a name="WebSocketAsPromised+onMessage"></a>

#### wsp.onMessage ⇒ <code>Channel</code>
Event channel triggered every time when message received from server.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onMessage.addListener(message => console.log(message));
```
<a name="WebSocketAsPromised+onUnpackedMessage"></a>

#### wsp.onUnpackedMessage ⇒ <code>Channel</code>
Event channel triggered every time when received message is successfully unpacked.
For example, if you are using JSON transport, the listener will receive already JSON parsed data.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onUnpackedMessage.addListener(data => console.log(data.foo));
```
<a name="WebSocketAsPromised+onResponse"></a>

#### wsp.onResponse ⇒ <code>Channel</code>
Event channel triggered every time when response to some request comes.
Received message considered a response if requestId is found in it.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onResponse.addListener(data => console.log(data));
```
<a name="WebSocketAsPromised+onClose"></a>

#### wsp.onClose ⇒ <code>Channel</code>
Event channel triggered when connection closed.
Listener accepts single argument `{code, reason}`.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onClose.addListener(event => console.log(`Connections closed: ${event.reason}`));
```
<a name="WebSocketAsPromised+onError"></a>

#### wsp.onError ⇒ <code>Channel</code>
Event channel triggered when by Websocket 'error' event.

**Kind**: instance property of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
**See**: https://vitalets.github.io/chnl/#channel  
**Example**  
```js
wsp.onError.addListener(event => console.error(event));
```
<a name="WebSocketAsPromised+open"></a>

#### wsp.open() ⇒ <code>Promise.&lt;Event&gt;</code>
Opens WebSocket connection. If connection already opened, promise will be resolved with "open event".

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="WebSocketAsPromised+sendRequest"></a>

#### wsp.sendRequest(data, [options]) ⇒ <code>Promise</code>
Performs request and waits for response.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type | Default |
| --- | --- | --- |
| data | <code>\*</code> |  | 
| [options] | <code>Object</code> |  | 
| [options.requestId] | <code>String</code> \| <code>Number</code> | <code>&lt;auto-generated&gt;</code> | 
| [options.timeout] | <code>Number</code> | <code>0</code> | 

<a name="WebSocketAsPromised+sendPacked"></a>

#### wsp.sendPacked(data)
Packs data with `options.packMessage` and sends to the server.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>\*</code> | 

<a name="WebSocketAsPromised+send"></a>

#### wsp.send(data)
Sends data without packing.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type |
| --- | --- |
| data | <code>String</code> \| <code>Blob</code> \| <code>ArrayBuffer</code> | 

<a name="WebSocketAsPromised+waitUnpackedMessage"></a>

#### wsp.waitUnpackedMessage(predicate, [options]) ⇒ <code>Promise</code>
Waits for particular message to come.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| predicate | <code>function</code> |  | function to check incoming message. |
| [options] | <code>Object</code> |  |  |
| [options.timeout] | <code>Number</code> | <code>0</code> |  |
| [options.timeoutError] | <code>Error</code> |  |  |

**Example**  
```js
const response = await wsp.waitUnpackedMessage(data => data && data.foo === 'bar');
```
<a name="WebSocketAsPromised+close"></a>

#### wsp.close([code], [reason]) ⇒ <code>Promise.&lt;Event&gt;</code>
Closes WebSocket connection. If connection already closed, promise will be resolved with "close event".

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [code] | <code>number</code> | <code>1000</code> | A numeric value indicating the status code. |
| [reason] | <code>string</code> |  | A human-readable reason for closing connection. |

<a name="WebSocketAsPromised+removeAllListeners"></a>

#### wsp.removeAllListeners()
Removes all listeners from WSP instance. Useful for cleanup.

**Kind**: instance method of [<code>WebSocketAsPromised</code>](#WebSocketAsPromised)  
<a name="Options"></a>

### Options : <code>Object</code>
**Kind**: global typedef  
**Defaults**: please see [options.js](https://github.com/vitalets/websocket-as-promised/blob/master/src/options.js)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [createWebSocket] | <code>function</code> | <code>url &#x3D;&gt; new WebSocket(url)</code> | custom function for WebSocket construction. |
| [packMessage] | <code>function</code> | <code>noop</code> | packs message for sending. For example, `data => JSON.stringify(data)`. |
| [unpackMessage] | <code>function</code> | <code>noop</code> | unpacks received message. For example, `data => JSON.parse(data)`. |
| [attachRequestId] | <code>function</code> | <code>noop</code> | injects request id into data. For example, `(data, requestId) => Object.assign({requestId}, data)`. |
| [extractRequestId] | <code>function</code> | <code>noop</code> | extracts request id from received data. For example, `data => data.requestId`. |
| [extractMessageData] | <code>function</code> | <code>event &#x3D;&gt; event.data</code> | extracts data from event object. |
| timeout | <code>Number</code> | <code>0</code> | timeout for opening connection and sending messages. |
| connectionTimeout | <code>Number</code> | <code>0</code> | special timeout for opening connection, by default equals to `timeout`. |

## Changelog
Please see [CHANGELOG.md](CHANGELOG.md).

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

<div align="center">
* * *<br>
<i>If you love :heart: JavaScript and would like to track new trending repositories, <br>
have a look on <a href="https://github.com/vitalets/github-trending-repos">vitalets/github-trending-repos</a>.</i>
</div>

[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
