
const {createWSP} = require('../helper');

describe('sendRaw', function () {
  beforeEach(function () {
    this.wsp = createWSP(this.url, {
      packMessage: null,
      unpackMessage: null
    });
  });

  it('should send string and does not return promise', function () {
    let result, response;
    this.wsp.onMessage.addListener((data, msg) => response = {data, msg});
    const p = this.wsp.open()
      .then(() => result = this.wsp.sendRaw('foo'))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => {
        assert.equal(result, undefined);
        assert.deepEqual(response, {data: undefined, msg: 'foo'});
      });
  });

  it('should send ArrayBuffer and does not return promise', function () {
    let result, response;
    this.wsp.onMessage.addListener((data, msg) => response = {data, msg});
    const p = this.wsp.open()
      .then(() => result = this.wsp.sendRaw((new Uint8Array([1,2,3])).buffer))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => {
        assert.equal(result, undefined);
        assert.equal(response.data, undefined);
        assert.equal(String(new Uint8Array(response.msg)), '1,2,3');
      });
  });

  it('should throw if sending without open', function () {
    return assert.throws(() => this.wsp.sendRaw('foo'), 'Can not send data because WebSocket is not opened.');
  });
});
