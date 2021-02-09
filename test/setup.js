const assert = require('assert').strict;
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require(process.env.LIB_PATH || '../');

global.assert = assert;
global.noop = () => {};
global.wait = ms => new Promise(r => setTimeout(r, ms));
global.createWSP = (url, options) => new WebSocketAsPromised(url, Object.assign({
  createWebSocket: url => new W3CWebSocket(url),
}, options));

require('./hooks');
