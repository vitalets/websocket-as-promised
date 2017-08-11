const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = process.env.TEST_LIB ? require('../lib') : require('../src');
const server = require('./server');

chai.use(chaiAsPromised);
const assert = chai.assert;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createWebSocket(url) {
  return new W3CWebSocket(url);
}

const NORMAL_CLOSE_CODE = 1000;

describe('WebSocketAsPromised', function () {

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
    this.wsp = new WebSocketAsPromised(this.url, {createWebSocket});
  });

  afterEach(function () {
    return this.wsp.close();
  });

  describe('open', function () {
    it('should resolve with correct type', function () {
      const res = this.wsp.open();
      return assert.eventually.propertyVal(res, 'type', 'open');
    });

    it('should return the same opening promise on several calls', function () {
      const p1 = this.wsp.open();
      const p2 = this.wsp.open();
      assert.equal(p1, p2);
      return assert.eventually.propertyVal(p1, 'type', 'open');
    });

    it('should return the same opening promise on several open calls (with timeout)', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 50});
      const p1 = wsp.open();
      const p2 = wsp.open();
      assert.equal(p1, p2);
      return assert.eventually.propertyVal(p1, 'type', 'open');
    });

    it('should reject promise if server rejects the request', function () {
      const wsp = new WebSocketAsPromised(this.url + '?reject=1', {createWebSocket});
      const p = wsp.open();
      return assert.isRejected(p, 'Connection closed with reason: connection failed (1006)');
    });

    it('should reject for invalid url', function () {
      const wsp = new WebSocketAsPromised('abc', {createWebSocket});
      const p = wsp.open();
      return assert.isRejected(p, 'You must specify a full WebSocket URL, including protocol.');
    });

    it('should resolve with the same promise when opening already opened connection', function () {
      let p1 = this.wsp.open();
      let p2;
      const res = p1.then(() => p2 = this.wsp.open());
      return assert.eventually.propertyVal(res, 'type', 'open')
        .then(() => assert.equal(p1, p2));
    });

    it('should re-open', function () {
      const p = this.wsp.open()
        .then(() => this.wsp.close())
        .then(() => this.wsp.open());
      return assert.eventually.propertyVal(p, 'type', 'open');
    });
  });

  describe('request', function () {
    it('should resolve promise after response', function () {
      const res = this.wsp.open().then(() => this.wsp.request({foo: 'bar'}));
      return Promise.all([
        assert.eventually.propertyVal(res, 'foo', 'bar'),
        assert.eventually.property(res, 'id')
      ]);
    });

    it('should allow to set id manually', function () {
      const res = this.wsp.open().then(() => this.wsp.request({foo: 'bar', id: 1}));
      return assert.eventually.propertyVal(res, 'id', 1);
    });

    it('should not fulfill for response without ID', function () {
      let a = 0;
      const res = this.wsp.open()
        .then(() => {
          this.wsp.request({noId: true}).then(() => a = a + 1, () => {
          });
          return sleep(100).then(() => a);
        });
      return assert.eventually.equal(res, 0);
    });
  });

  describe('sendJson', function () {
    it('should send data and does not return promise', function () {
      const p = this.wsp.open().then(() => {
        const res = this.wsp.sendJson({foo: 'bar', id: 1});
        assert.equal(res, undefined);
      });
      return assert.isFulfilled(p);
    });
  });

  describe('send', function () {
    it('should send String and does not return promise', function () {
      const p = this.wsp.open().then(() => {
        const res = this.wsp.send('foo');
        assert.equal(res, undefined);
      });
      return assert.isFulfilled(p);
    });

    it('should send ArrayBuffer and does not return promise', function () {
      const p = this.wsp.open().then(() => {
        const data = new Uint8Array([1,2,3]);
        const res = this.wsp.send(data.buffer);
        assert.equal(res, undefined);
      });
      return assert.isFulfilled(p);
    });

    it('should throw if sending without open', function () {
      return assert.throws(() => this.wsp.send('foo'), 'Can not send data because WebSocket is not opened.');
    });
  });

  describe('close', function () {
    it('should close connection', function () {
      const res = this.wsp.open().then(() => this.wsp.close());
      return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
    });

    it('should return the same closing promise for several calls', function () {
      const res = this.wsp.open().then(() => {
        const p1 = this.wsp.close();
        const p2 = this.wsp.close();
        assert.equal(p1, p2);
        return p2;
      });
      return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
    });

    it('should return the same closing promise for several close calls (with timeout)', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 50});
      const res = wsp.open().then(() => {
        const p1 = wsp.close();
        const p2 = wsp.close();
        assert.equal(p1, p2);
        return p2;
      });
      return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
    });

    it('should resolve with the same promise for already closed connection', function () {
      let p1;
      let p2;
      const res = this.wsp.open()
        .then(() => p1 = this.wsp.close())
        .then(() => p2 = this.wsp.close());
      return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE)
        .then(() => assert.equal(p1, p2));
    });

    it('should resolve with undefined for not-opened connection', function () {
      const p = this.wsp.close();
      return assert.eventually.equal(p, undefined);
    });

    it('should reject all pending requests', function () {
      const a = [];
      const res = this.wsp.open()
        .then(() => {
          this.wsp.request({delay: 100}).catch(e => a.push(e.message));
          this.wsp.request({delay: 200}).catch(e => a.push(e.message));
        })
        .then(() => sleep(10).then(() => this.wsp.close()).then(() => a));
      return assert.eventually.deepEqual(res, [
        'Connection closed with reason: Normal connection closure (1000)',
        'Connection closed with reason: Normal connection closure (1000)',
      ]);
    });
  });

  describe('close by server', function () {
    it('should reject for close', function () {
      const res = this.wsp.open()
        .then(() => this.wsp.request({
          close: true,
          code: 1009,
          reason: 'Message is too big'
        }));
      return assert.isRejected(res, 'Connection closed with reason: Message is too big (1009)');
    });

    it('should reject for drop', function () {
      const res = this.wsp.open()
        .then(() => this.wsp.request({drop: true}));
      return assert.isRejected(res, /Connection closed/);
    });
  });

  describe('idProp', function () {
    it('should be customized by options', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket, idProp: 'myId'});
      const res = wsp.open().then(() => wsp.request({foo: 'bar'}));
      return Promise.all([
        assert.eventually.propertyVal(res, 'foo', 'bar'),
        assert.eventually.property(res, 'myId'),
      ]);
    });

    it('should not overwrite if options.idProp is undefined', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket, idProp: undefined});
      const res = wsp.open().then(() => wsp.request({foo: 'bar'}));
      return Promise.all([
        assert.eventually.propertyVal(res, 'foo', 'bar'),
        assert.eventually.property(res, 'id'),
      ]);
    });
  });

  describe('onMessage', function () {
    it('should dispatch data and jsonData after json response', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
      const res = new Promise(resolve => {
        wsp.onMessage.addListener((jsonData, data) => resolve({jsonData, data}));
        wsp.open().then(() => wsp.request({foo: 'bar'}));
      });
      return assert.isFulfilled(res).then(r => {
        assert.include(r.data, '"foo":"bar"');
        assert.propertyVal(r.jsonData, 'foo', 'bar');
      });
    });

    it('should dispatch data and jsonData=undefined after non-json response', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
      const res = new Promise(resolve => {
        wsp.onMessage.addListener((jsonData, data) => resolve({jsonData, data}));
        wsp.open().then(() => wsp.request({nonJSONResponse: true})).catch(() => {});
      });
      return assert.isFulfilled(res).then(r => {
        assert.include(r.data, 'non JSON response');
        assert.equal(r.jsonData, undefined);
      });
    });

    // todo: find way to write this test. Currently it fails because mocha listens window.onerror
    it.skip('should dispatch data after string request', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
      const res = new Promise(resolve => {
        wsp.onMessage.addListener(resolve);
        wsp.open().then(() => wsp.request({nonJSONResponse: true})).catch(() => {});
      });
      return assert.eventually.propertyVal(res, 'foo', 'bar');
    });
  });

  describe('onClose', function () {
    it('should trigger after client close', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
      const res = new Promise(resolve => {
        wsp.onClose.addListener(resolve);
        wsp.open().then(() => wsp.close());
      });
      return assert.eventually.propertyVal(res, 'code', 1000);
    });

    it('should trigger after server close', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
      const res = new Promise(resolve => {
        wsp.onClose.addListener(resolve);
        wsp.open().then(() => wsp.request({close: true, code: 1009})).catch(() => {});
      });
      return assert.eventually.propertyVal(res, 'code', 1009);
    });
  });

  describe('request timeout', function () {
    it('should reject after timeout', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 50});
      const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 100}));
      return assert.isRejected(res, 'Request rejected by timeout (50 ms)');
    });

    it('should request before timeout', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 100});
      const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 50}));
      return assert.eventually.propertyVal(res, 'foo', 'bar');
    });

    it('should reject after custom timeout', function () {
      const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 100});
      const options = {timeout: 50};
      const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 70}, options));
      return assert.isRejected(res, 'Request rejected by timeout (50 ms)');
    });
  });

  describe('isOpening', function () {
    it('should be initially false', function () {
      assert.isFalse(this.wsp.isOpening);
    });

    it('should be true while opening', function () {
      const p = this.wsp.open();
      assert.isTrue(this.wsp.isOpening);
      return p.then(() => assert.isFalse(this.wsp.isOpening));
    });

    it('should be false when closing and close', function () {
      const p = this.wsp.open().then(() => {
        const p1 = this.wsp.close();
        assert.isFalse(this.wsp.isOpening);
        return p1;
      });
      return p.then(() => assert.isFalse(this.wsp.isOpening));
    });
  });

  describe('isOpened', function () {
    it('should be initially false', function () {
      assert.isFalse(this.wsp.isOpened);
    });

    it('should be true after open', function () {
      const p = this.wsp.open();
      assert.isFalse(this.wsp.isOpened);
      return p.then(() => assert.isTrue(this.wsp.isOpened));
    });

    it('should be false when closing and after close', function () {
      const p = this.wsp.open().then(() => {
        const p1 = this.wsp.close();
        assert.isFalse(this.wsp.isOpened);
        return p1;
      });
      return p.then(() => assert.isFalse(this.wsp.isOpened));
    });
  });

  describe('isClosing', function () {
    it('should be initially false', function () {
      assert.isFalse(this.wsp.isClosing);
    });

    it('should be false while opening and after open', function () {
      const p = this.wsp.open();
      assert.isFalse(this.wsp.isClosing);
      return p.then(() => assert.isFalse(this.wsp.isClosing));
    });

    it('should be true while closing', function () {
      const p = this.wsp.open().then(() => {
        const p1 = this.wsp.close();
        assert.isTrue(this.wsp.isClosing);
        return p1;
      });
      return p.then(() => assert.isFalse(this.wsp.isClosing));
    });
  });

  describe('isClosed', function () {
    it('should be initially true', function () {
      assert.isTrue(this.wsp.isClosed);
    });

    it('should be false while opening and after open', function () {
      const p = this.wsp.open();
      assert.isFalse(this.wsp.isClosed);
      return p.then(() => assert.isFalse(this.wsp.isClosed));
    });

    it('should be true after close', function () {
      const p = this.wsp.open().then(() => {
        const p1 = this.wsp.close();
        assert.isFalse(this.wsp.isClosed);
        return p1;
      });
      return p.then(() => assert.isTrue(this.wsp.isClosed));
    });
  });

});
