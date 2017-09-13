
const {createWSP} = require('../helper');

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
    const wsp = createWSP(this.url, {timeout: 50});
    const p1 = wsp.open();
    const p2 = wsp.open();
    assert.equal(p1, p2);
    return assert.eventually.propertyVal(p1, 'type', 'open');
  });

  it('should reject if server rejects the request', function () {
    const wsp = createWSP(this.url + '?reject=1');
    const p = wsp.open();
    return assert.isRejected(p, 'Connection closed with reason: connection failed (1006)');
  });

  it.skip('should reject after timeout and close connection', function () {
    const wsp = createWSP(this.url + '?delay=20', {timeout: 10});
    const p1 = wsp.open();
    return assert.isRejected(p1, 'Promise rejected by timeout (10 ms)')
      .then(() => assert.ok(wsp.isClosed));
  });

  it('should reject for invalid url', function () {
    const wsp = createWSP('abc', {timeout: 10});
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
