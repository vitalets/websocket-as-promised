
const {createWSP} = require('../helper');

describe('options', function () {
  it('should throw error for unknown option', function () {
    const fn = () => createWSP(this.url, {foo: 'bar'});
    assert.throws(fn, 'Unknown option: foo');
  });

  it('should allow empty packMessage / unpackMessage', function () {
    let response;
    const wsp = createWSP(this.url, {
      packMessage: null,
      unpackMessage: false,
    });
    wsp.onMessage.addListener((data, msg) => response = [data, msg]);
    const p = wsp.open()
      .then(() => wsp.sendRaw('foo'))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => assert.deepEqual(response, [undefined, 'foo']));
  });
});
