# websocket-as-promised

> W3C [WebSocket] with [Promise]-based API

## Installation
```bash
npm install websocket-as-promised --save
```

## Usage
```js


```

## API

* `.add(fn)` - calls `fn` and returns new promise. `fn` gets unique `id` as parameter. 
* `.set(id, fn)` - calls `fn` and returns new promise with specified `id`.
* `.resolve(id, value)` - resolves pending promise by `id` with specified `value`
* `.reject(id, reason)` - rejects pending promise by `id` with specified `reason`
* `.fulfill(id, reason)` - rejects pending promise if `reason` is specified, otherwise resolves with empty value 

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)

[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
[Promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise 
