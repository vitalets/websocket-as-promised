const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = process.env.TEST_LIB ? require('../lib') : require('../src');

const createWebSocket = url => new W3CWebSocket(url);
const createWSP = (url, options) => new WebSocketAsPromised(url, Object.assign({createWebSocket}, options));

exports.NORMAL_CLOSE_CODE = 1000;
exports.createWebSocket = createWebSocket;
exports.createWSP = createWSP;

