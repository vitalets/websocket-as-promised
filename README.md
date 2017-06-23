# websocket-as-promised

> Wraps [W3C WebSocket] with [Promise]-based API

## Installation
```bash
npm install websocket-as-promised --save
```

## Usage
```js
const WebSocketAsPromised = require('websocket-as-promised');

const wsp = new WebSocketAsPromised();
wsp.open('ws://echo.websocket.org')
  .then(() => wsp.send({foo: 'bar'}))
  .then(response => console.log(response.id))
  .then(() => wsp.close())
  .catch(e => console.error(e));

```

## API

#### new WebSocketAsPromised(CustomWebSocket)
```
/**
 * Constructor
 *
 * @param {Object} [CustomWebSocket] custom WebSocket constructor. By default, `window.WebSocket`
 */
```
#### open(url)
```
/**
 * Open WebSocket connection
 *
 * @param {String} url
 * @returns {Promise}
 */
```
#### send(data)
```
/**
 * Send data and wait for response containing `id` property
 *
 * @param {Object} data
 * @returns {Promise}
 */
```
#### close()
```
/**
 * Close WebSocket connection
 *
 * @returns {Promise}
 */
```

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[W3C WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise 
