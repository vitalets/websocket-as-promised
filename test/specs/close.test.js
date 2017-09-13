
const {createWSP} = require('../helper');


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
      .then(() => wait(10).then(() => this.wsp.close()).then(() => a));
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
