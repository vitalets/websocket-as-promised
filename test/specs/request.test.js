
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
      .then(data => assert.ok(data.requestId.startsWith('req')));
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
      // todo: use assert match
        .then(e => assert.ok(e.message.startsWith('WebSocket request was rejected by timeout (50 ms)')));
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
      // todo: use assert match
        .then(e => assert.ok(e.message.startsWith('WebSocket request was rejected by timeout (50 ms)')));
    });
  });
});

