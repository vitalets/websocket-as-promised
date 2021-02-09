
describe('send', function () {
  it('should not return promise', async function () {
    await this.wsp.open();
    const res = this.wsp.send('foo');
    assert.equal(res, undefined);
  });

  it('should throw if sending without open', function () {
    const fn = () => this.wsp.send('foo');
    assert.throws(fn, /Can't send data because WebSocket is not opened/);
  });

  it('should send string', async function () {
    await this.wsp.open();
    const p = new Promise(resolve => this.wsp.onMessage.addListener(message => resolve(message)));
    this.wsp.send('foo');
    assert.equal((await p), 'foo');
  });

  it('should send ArrayBuffer', async function () {
    await this.wsp.open();
    const p = new Promise(resolve => this.wsp.onMessage.addListener(message => resolve(message)));
    this.wsp.send(new Uint8Array([1,2,3]).buffer);
    assert.equal(String(new Uint8Array(await p)), '1,2,3');
  });

  it('should trigger onSend', async function () {
    await this.wsp.open();
    const p = new Promise(resolve => this.wsp.onSend.addListener(message => resolve(message)));
    this.wsp.send('foo');
    assert.equal((await p), 'foo');
  });
});
