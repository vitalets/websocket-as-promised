
// const {createWSP} = require('../helper');

describe.skip('sendJson', function () {
  it('should send data and does not return promise', function () {
    const p = this.wsp.open().then(() => {
      const res = this.wsp.sendJson({foo: 'bar', id: 1});
      assert.equal(res, undefined);
    });
    return assert.isFulfilled(p);
  });
});

describe.skip('send', function () {
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
