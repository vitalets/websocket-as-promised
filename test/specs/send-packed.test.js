
describe('sendPacked', function () {

  beforeEach(function () {
    this.wsp = createWSP(this.url, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),
    });
  });

  it('should not return promise', function () {
    const p = this.wsp.open()
      .then(() => this.wsp.sendPacked({foo: 'bar'}))
      .then(r => assert.equal(r, undefined));
    return assert.isFulfilled(p);
  });

  it('should throw if sending without open', function () {
    const fn = () => this.wsp.sendPacked({foo: 'bar'});
    return assert.throws(fn, `Can't send data because WebSocket is not opened.`);
  });

  it('should throw if packMessage is not defined', function () {
    const wsp = createWSP(this.url, {
      packMessage: null,
      unpackMessage: data => JSON.parse(data),
    });
    const p = wsp.open().then(() => wsp.sendPacked({foo: 'bar'}));
    return assert.isRejected(p,
      `Please define 'options.packMessage / options.unpackMessage' for sending packed messages.`
    );
  });

  it('should throw if unpackMessage is not defined', function () {
    const wsp = createWSP(this.url, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: null,
    });
    const p = wsp.open().then(() => wsp.sendPacked({foo: 'bar'}));
    return assert.isRejected(p,
      `Please define 'options.packMessage / options.unpackMessage' for sending packed messages.`
    );
  });

  it('should send JSON (stringify and parse)', function () {
    let response;
    this.wsp.onUnpackedMessage.addListener(data => response = data);
    const p = this.wsp.open()
      .then(() => this.wsp.sendPacked({foo: 'bar'}))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => assert.deepEqual(response, {foo: 'bar'}));
  });

  it('should send binary data', function () {
    const wsp = createWSP(this.url, {
      packMessage: data => (new Uint8Array(data)).buffer,
      unpackMessage: message => new Uint8Array(message),
    });
    let response;
    wsp.onUnpackedMessage.addListener(data => response = data);
    const p = wsp.open()
      .then(() => wsp.sendPacked([1, 2, 3]))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => assert.equal(String(response), '1,2,3'));
  });
});
