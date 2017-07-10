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
    this.wsp = new WebSocketAsPromised({createWebSocket});
  });

  afterEach(function () {
    if (this.wsp.ws) {
      return this.wsp.close();
    }
  });

  describe('open', function () {
    it('should resolve with correct type', function () {
      const res = this.wsp.open(this.url);
      return assert.eventually.propertyVal(res, 'type', 'open');
    });

    it('should return the same opening promise on several calls', function () {
      const p1 = this.wsp.open(this.url);
      const p2 = this.wsp.open(this.url);
      assert.equal(p1, p2);
      return assert.eventually.propertyVal(p1, 'type', 'open');
    });

    it('should reject promise if server rejects the request', function () {
      const res = this.wsp.open(this.url + '?reject=1');
      return assert.isRejected(res, 'Connection closed with reason: connection failed (1006)');
    });

    it('should reject for invalid url', function () {
      const res = this.wsp.open('abc');
      return assert.isRejected(res, 'You must specify a full WebSocket URL, including protocol.');
    });
  });

  describe('request', function () {
    it('should resolve promise after response', function () {
      const res = this.wsp.open(this.url).then(() => this.wsp.request({foo: 'bar'}));
      return Promise.all([
        assert.eventually.propertyVal(res, 'foo', 'bar'),
        assert.eventually.property(res, 'id')
      ]);
    });

    it('should allow to set id manually', function () {
      const res = this.wsp.open(this.url).then(() => this.wsp.request({foo: 'bar', id: 1}));
      return assert.eventually.propertyVal(res, 'id', 1);
    });

    it('should not fulfill for response without ID', function () {
      let a = 0;
      const res = this.wsp.open(this.url)
        .then(() => {
          this.wsp.request({noId: true}).then(() => a = a + 1, () => {
          });
          return sleep(100).then(() => a);
        });
      return assert.eventually.equal(res, 0);
    });
  });

  describe('send', function () {
    it('should not return Promise', function () {
      const p = this.wsp.open(this.url).then(() => {
        const res = this.wsp.send({foo: 'bar', id: 1});
        assert.equal(res, undefined);
      });
      return assert.isFulfilled(p);
    });
  });

  describe('close', function () {
    it('should close connection', function () {
      const CLOSE_NORMAL = 1000;
      const res = this.wsp.open(this.url).then(() => this.wsp.close());
      return assert.eventually.propertyVal(res, 'code', CLOSE_NORMAL);
    });

    it('should return the same closing promise for several calls', function () {
      const CLOSE_NORMAL = 1000;
      const res = this.wsp.open(this.url).then(() => {
        const p1 = this.wsp.close();
        const p2 = this.wsp.close();
        assert.equal(p1, p2);
        return p2;
      });
      return assert.eventually.propertyVal(res, 'code', CLOSE_NORMAL);
    });

    it('should reject all pending requests', function () {
      const a = [];
      const res = this.wsp.open(this.url)
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
      const res = this.wsp.open(this.url)
        .then(() => this.wsp.request({
          close: true,
          code: 1009,
          reason: 'Message is too big'
        }));
      return assert.isRejected(res, 'Connection closed with reason: Message is too big (1009)');
    });

    it('should reject for drop', function () {
      const res = this.wsp.open(this.url)
        .then(() => this.wsp.request({drop: true}));
      return assert.isRejected(res, /Connection closed/);
    });
  });

  describe('idProp', function () {
    it('should be customized by options', function () {
      const wsp = new WebSocketAsPromised({createWebSocket, idProp: 'myId'});
      const res = wsp.open(this.url).then(() => wsp.request({foo: 'bar'}));
      return Promise.all([
        assert.eventually.propertyVal(res, 'foo', 'bar'),
        assert.eventually.property(res, 'myId'),
      ]);
    });
  });

  describe('onMessage', function () {
    it('should dispatch data', function () {
      const wsp = new WebSocketAsPromised({createWebSocket});
      const res = new Promise(resolve => {
        wsp.onMessage.addListener(resolve);
        wsp.open(this.url).then(() => wsp.request({foo: 'bar'}));
      });
      return assert.eventually.propertyVal(res, 'foo', 'bar');
    });
  });

  describe('timeout', function () {
    it('should reject request after timeout', function () {
      const wsp = new WebSocketAsPromised({createWebSocket, timeout: 50});
      const res = wsp.open(this.url).then(() => wsp.request({foo: 'bar', delay: 100}));
      return assert.isRejected(res, 'Promise rejected by timeout (50 ms)');
    });

    it('should resolve request before timeout', function () {
      const wsp = new WebSocketAsPromised({createWebSocket, timeout: 100});
      const res = wsp.open(this.url).then(() => wsp.request({foo: 'bar', delay: 50}));
      return assert.eventually.propertyVal(res, 'foo', 'bar');
    });

    it('should reject request after custom timeout', function () {
      const wsp = new WebSocketAsPromised({createWebSocket, timeout: 100});
      const options = {timeout: 50};
      const res = wsp.open(this.url).then(() => wsp.request({foo: 'bar', delay: 70}, options));
      return assert.isRejected(res, 'Promise rejected by timeout (50 ms)');
    });

    it('should return the same opening promise on several open calls', function () {
      const wsp = new WebSocketAsPromised({createWebSocket, timeout: 50});
      const p1 = wsp.open(this.url);
      const p2 = wsp.open(this.url);
      assert.equal(p1, p2);
      return assert.eventually.propertyVal(p1, 'type', 'open');
    });

    it('should return the same closing promise for several close calls', function () {
      const CLOSE_NORMAL = 1000;
      const wsp = new WebSocketAsPromised({createWebSocket, timeout: 50});
      const res = wsp.open(this.url).then(() => {
        const p1 = wsp.close();
        const p2 = wsp.close();
        assert.equal(p1, p2);
        return p2;
      });
      return assert.eventually.propertyVal(res, 'code', CLOSE_NORMAL);
    });
  });

  describe('isConnecting', function () {
    it('should be true while opening', function () {
      assert.notOk(this.wsp.isConnecting);
      const p = this.wsp.open(this.url);
      assert.ok(this.wsp.isConnecting);
      return p.then(() => assert.notOk(this.wsp.isConnecting));
    });

    it('should be false when closing and close', function () {
      const p = this.wsp.open(this.url).then(() => {
        const p1 = this.wsp.close();
        assert.notOk(this.wsp.isConnecting);
        return p1;
      });
      return p.then(() => assert.notOk(this.wsp.isConnecting));
    });
  });

  describe('isConnected', function () {
    it('should be true after open', function () {
      assert.notOk(this.wsp.isConnected);
      const p = this.wsp.open(this.url);
      assert.notOk(this.wsp.isConnected);
      return p.then(() => assert.ok(this.wsp.isConnected));
    });

    it('should be false when closing and after close', function () {
      const p = this.wsp.open(this.url).then(() => {
        const p1 = this.wsp.close();
        assert.notOk(this.wsp.isConnected);
        return p1;
      });
      return p.then(() => assert.notOk(this.wsp.isConnected));
    });
  });

  describe('isDisconnecting', function () {
    it('should be false while opening and after open', function () {
      assert.notOk(this.wsp.isDisconnecting);
      const p = this.wsp.open(this.url);
      assert.notOk(this.wsp.isDisconnecting);
      return p.then(() => assert.notOk(this.wsp.isDisconnecting));
    });

    it('should be true while closing', function () {
      const p = this.wsp.open(this.url).then(() => {
        const p1 = this.wsp.close();
        assert.ok(this.wsp.isDisconnecting);
        return p1;
      });
      return p.then(() => assert.notOk(this.wsp.isDisconnecting));
    });
  });

});
