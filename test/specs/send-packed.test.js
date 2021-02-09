
describe('sendPacked', function () {

  beforeEach(function () {
    this.wsp = createWSP(this.url, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),
    });
  });

  it('should not return promise', async function () {
    await this.wsp.open();
    const res = this.wsp.sendPacked('foo');
    assert.equal(res, undefined);
  });

  it('should throw if sending without open', function () {
    const fn = () => this.wsp.sendPacked({foo: 'bar'});
    assert.throws(fn, /Can't send data because WebSocket is not opened/);
  });

  it('should throw if packMessage is not defined', async function () {
    const wsp = createWSP(this.url, {
      packMessage: null,
      unpackMessage: data => JSON.parse(data),
    });
    await wsp.open();
    const fn = () => wsp.sendPacked({foo: 'bar'});
    assert.throws(fn, /Please define 'options.packMessage \/ options.unpackMessage' for sending packed messages/);
  });

  it('should throw if unpackMessage is not defined', async function () {
    const wsp = createWSP(this.url, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: null,
    });
    await wsp.open();
    const fn = () => wsp.sendPacked({foo: 'bar'});
    assert.throws(fn, /Please define 'options.packMessage \/ options.unpackMessage' for sending packed messages/);
  });

  it('should send JSON (stringify and parse)', async function () {
    await this.wsp.open();
    const p = new Promise(resolve => this.wsp.onUnpackedMessage.addListener(data => resolve(data)));
    this.wsp.sendPacked({foo: 'bar'});
    assert.deepEqual((await p), {foo: 'bar'});
  });

  it('should send binary data', async function () {
    const wsp = createWSP(this.url, {
      packMessage: data => (new Uint8Array(data)).buffer,
      unpackMessage: message => new Uint8Array(message),
    });
    await wsp.open();
    const p = new Promise(resolve => wsp.onUnpackedMessage.addListener(data => resolve(data)));
    wsp.sendPacked([1, 2, 3]);
    assert.deepEqual(String(await p), '1,2,3');
  });

  it('should wait for unpackMessage when it returns promise (#34)', async function () {
    const wsp = createWSP(this.url, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: async data => JSON.parse(data),
    });
    await wsp.open();
    let response;
    wsp.onUnpackedMessage.addListener(data => response = data);
    const p = new Promise(resolve => wsp.onUnpackedMessage.addListener(resolve));
    wsp.sendPacked({foo: 'bar'});
    await p;
    assert.deepEqual(response, {foo: 'bar'});
  });
});
