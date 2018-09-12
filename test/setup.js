const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');
const W3CWebSocket = require('websocket').w3cwebsocket;
const srcPath = process.env.LIB_PATH || 'src';
const WebSocketAsPromised = require(path.resolve(srcPath));

console.log(`Require websocket-as-promised from: ${srcPath}`);

chai.use(chaiAsPromised);

global.assert = chai.assert;
global.noop = () => {};
global.wait = ms => new Promise(r => setTimeout(r, ms));
global.createWSP = (url, options) => new WebSocketAsPromised(url, Object.assign({
  createWebSocket: url => new W3CWebSocket(url),
}, options));

require('./hooks');
