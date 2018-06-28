
describe('send', function () {
  it('should not return promise', function () {
    const p = this.wsp.open()
      .then(() => this.wsp.send('foo'))
      .then(r => assert.equal(r, undefined));
    return assert.isFulfilled(p);
  });

  it('should throw if sending without open', function () {
    const fn = () => this.wsp.send('foo');
    return assert.throws(fn, `Can't send data because WebSocket is not opened.`);
  });

  it('should send string', function () {
    let response;
    this.wsp.onMessage.addListener(message => response = message);
    const p = this.wsp.open()
      .then(() => this.wsp.send('foo'))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => assert.equal(response, 'foo'));
  });

  it('should send ArrayBuffer', function () {
    let response;
    this.wsp.onMessage.addListener(message => response = message);
    const p = this.wsp.open()
      .then(() => this.wsp.send((new Uint8Array([1,2,3])).buffer))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => assert.equal(String(new Uint8Array(response)), '1,2,3'));
  });

  it('should trigger onSend', function () {
    let sentData;
    this.wsp.onSend.addListener(data => sentData = data);
    const p = this.wsp.open()
      .then(() => this.wsp.send('foo'))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => assert.equal(sentData, 'foo'));
  });
});
