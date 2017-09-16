
const {createWSP} = require('../helper');

describe('request', function () {
  it('should resolve promise after response', function () {
    const res = this.wsp.open().then(() => this.wsp.request({foo: 'bar'}));
    return Promise.all([
      assert.eventually.propertyVal(res, 'foo', 'bar'),
      assert.eventually.property(res, 'requestId')
    ]);
  });

  it('should allow to set requestId', function () {
    const res = this.wsp.open()
      .then(() => this.wsp.request({foo: 'bar'}, {requestId: '1'}));
    return assert.eventually.propertyVal(res, 'requestId', '1');
  });

  it('should allow to set requestIdPrefix', function () {
    const res = this.wsp.open()
      .then(() => this.wsp.request({foo: 'bar'}, {requestIdPrefix: 'req'}));
    return assert.isFulfilled(res)
      .then(data => assert.match(data.requestId, /^req/));
  });

  it.skip('should reject request if another request with the same requestId starts', function () {
    let p1;
    const res = this.wsp.open()
      .then(() => {
        p1 = this.wsp.request({noResponse: true}, {requestId: '1'});
      })
      .then(() => this.wsp.request({}, {requestId: '1'}));
    return Promise.all([
      assert.isFulfilled(res),
      assert.isRejected(p1),
    ]);
  });

  describe('timeout', function () {
    it('should reject after timeout', function () {
      const wsp = createWSP(this.url, {timeout: 50});
      const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 100}));
      return assert.isRejected(res)
        .then(e => assert.match(e.message, /^WebSocket request was rejected by timeout \(50 ms\)/));
    });

    it('should request before timeout', function () {
      const wsp = createWSP(this.url, {timeout: 100});
      const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 50}));
      return assert.eventually.propertyVal(res, 'foo', 'bar');
    });

    it('should reject after custom timeout', function () {
      const wsp = createWSP(this.url, {timeout: 100});
      const options = {timeout: 50};
      const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 70}, options));
      return assert.isRejected(res)
        .then(e => assert.match(e.message, /^WebSocket request was rejected by timeout \(50 ms\)/));
    });
  });

  describe('packRequest', function () {
    it('should pack request', function () {
      const wsp = createWSP(this.url, {
        packRequest: requestId => {
          return JSON.stringify({requestId, x: '123'});
        }
      });
      const res = wsp.open()
        .then(() => wsp.request({foo: 'bar'}));
      return assert.eventually.propertyVal(res, 'x', '123');
    });

    it('should reject in case of error in packRequest', function () {
      const wsp = createWSP(this.url, {
        packRequest: () => {
          throw new Error('err');
        }
      });
      const res = wsp.open()
        .then(() => wsp.request());
      return assert.isRejected(res, 'err');
    });
  });

  describe('unpackResponse', function () {
    it('should catch error in unpackResponse', function () {
      const wsp = createWSP(this.url, {
        unpackResponse: () => {
          throw new Error('err');
        }
      });
      const res = wsp.open()
        .then(() => wsp.request({}, {timeout: 10}));
      return assert.isRejected(res)
        .then(e => assert.match(e.message, /^WebSocket request was rejected by timeout \(10 ms\)/));
    });
  });

});

