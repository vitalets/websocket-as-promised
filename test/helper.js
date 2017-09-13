const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = process.env.TEST_LIB ? require('../lib') : require('../src');
const server = require('./server');

const createWebSocket = url => new W3CWebSocket(url);
const createWSP = (url, options) => new WebSocketAsPromised(url, Object.assign({createWebSocket}, options));

exports.NORMAL_CLOSE_CODE = 1000;
exports.createWebSocket = createWebSocket;
exports.createWSP = createWSP;

before(function (done) {
  server.start(url => {
    this.url = url;
    done();
  });
});

after(function (done) {
  server.stop(() => done());
});

beforeEach(function () {
  this.wsp = createWSP(this.url);
});

afterEach(function () {
  return this.wsp.close();
});
