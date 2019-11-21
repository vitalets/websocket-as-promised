const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require(process.env.LIB_PATH || '../');

chai.use(chaiAsPromised);

global.assert = chai.assert;
global.noop = () => {};
global.wait = ms => new Promise(r => setTimeout(r, ms));
global.createWSP = (url, options) => new WebSocketAsPromised(url, Object.assign({
  createWebSocket: url => new W3CWebSocket(url),
}, options));

require('./hooks');
