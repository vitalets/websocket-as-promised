
const NORMAL_CLOSE_CODE = 1000;

describe('close', function () {
  it('should close connection', function () {
    const res = this.wsp.open().then(() => this.wsp.close());
    return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
  });

  it('should return the same closing promise for several calls while closing', function () {
    const res = this.wsp.open().then(() => {
      const p1 = this.wsp.close();
      const p2 = this.wsp.close();
      assert.equal(p1, p2);
      return p2;
    });
    return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
  });

  it('should return the same closing promise for several close calls (with timeout)', function () {
    const wsp = createWSP(this.url, {timeout: 50});
    const res = wsp.open().then(() => {
      const p1 = wsp.close();
      const p2 = wsp.close();
      assert.equal(p1, p2);
      return p2;
    });
    return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
  });

  it('should resolve with the same event for already closed connection', function () {
    let p1;
    let p2;
    const res = this.wsp.open()
      .then(() => p1 = this.wsp.close())
      .then(() => p2 = this.wsp.close());
    return assert.isFulfilled(res)
      .then(() => Promise.all([p1, p2]))
      .then(arr => assert.equal(arr[0].code, arr[1].code));
  });

  it('should resolve with undefined for not-opened connection', function () {
    const p = this.wsp.close();
    return assert.eventually.equal(p, undefined);
  });

  it('should reject all pending requests', function () {
    const wsp = createWSP(this.url, this.wspOptionsJson);
    const a = [];
    const res = wsp.open()
      .then(() => {
         wsp.sendRequest({noResponse: true}).catch(e => a.push(e.message));
         wsp.sendRequest({noResponse: true}).catch(e => a.push(e.message));
      })
      // need this tiny delay, as otherwise server hangs on getting 2 requests and closing simultaneously
      .then(() => wait(10))
      .then(() => wsp.close())
      // need this tiny delay to reject all responses
      .then(() => wait(10))
      .then(() => a);
    return assert.isFulfilled(res).then(() => {
      assert.deepEqual(a, [
        'WebSocket closed with reason: Normal connection closure (1000).',
        'WebSocket closed with reason: Normal connection closure (1000).',
      ]);
    });
  });

  it('should trigger onClose (initiated by client)', function () {
    const wsp = createWSP(this.url);
    const res = new Promise(resolve => {
      wsp.onClose.addListener(resolve);
      wsp.open().then(() => wsp.close());
    });
    return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
  });

  describe('by server', function () {
    it('should reject request', function () {
      const wsp = createWSP(this.url, this.wspOptionsJson);
      const res = wsp.open()
        .then(() => wsp.sendRequest({
          close: true,
          code: 1009,
          reason: 'Message is too big'
        }));
      return assert.isRejected(res, 'WebSocket closed with reason: Message is too big (1009).');
    });

    it('should reject for drop', function () {
      const wsp = createWSP(this.url, this.wspOptionsJson);
      const res = wsp.open()
        .then(() => wsp.sendRequest({drop: true}));
      return assert.isRejected(res, /WebSocket closed/);
    });

    it('should trigger onClose', function () {
      const wsp = createWSP(this.url);
      const res = new Promise(resolve => {
        wsp.onClose.addListener(resolve);
        wsp.open().then(() => wsp.send(JSON.stringify({close: true, code: 1009}))).catch(noop);
      });
      return assert.eventually.propertyVal(res, 'code', 1009);
    });
  });
});

