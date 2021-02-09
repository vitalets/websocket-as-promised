
describe('waitUnpackedMessage', function () {

  beforeEach(function () {
    this.wsp = createWSP(this.url, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),
    });
  });

  it('should wait and fulfill with matched unpacked message', async function () {
    await this.wsp.open();
    const p = this.wsp.waitUnpackedMessage(data => data.foo === 'bar');
    setTimeout(() => this.wsp.sendPacked({x: 'y'}), 5);
    setTimeout(() => this.wsp.sendPacked({foo: 'bar'}), 10);
    assert.deepEqual(await p, { foo: 'bar' });
  });

  it('should reject in case of invalid predicate', async function () {
    await this.wsp.open();
    const p = this.wsp.waitUnpackedMessage(data => data.x.y === 'invalid');
    setTimeout(() => this.wsp.sendPacked({foo: 'bar'}), 10);
    await assert.rejects(p, /Cannot read property 'y' of undefined/);
  });

  it('should reject after timeout', async function () {
    await this.wsp.open();
    const p = this.wsp.waitUnpackedMessage(data => data.foo === 'bar', {timeout: 10});
    await assert.rejects(p, /Timeout/);
  });

  it('should throw if predicate is missing', async function () {
    await this.wsp.open();
    const fn = () => this.wsp.waitUnpackedMessage();
    assert.throws(fn, /Predicate must be a function, got undefined/);
  });
});
