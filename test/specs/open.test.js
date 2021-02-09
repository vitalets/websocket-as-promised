describe('open', function () {
  it('should resolve with correct type', async function () {
    const res = await this.wsp.open();
    assert.equal(res.type, 'open');
  });

  it('should return the same opening promise on several calls', async function () {
    const p1 = this.wsp.open();
    const p2 = this.wsp.open();
    assert.equal(p1, p2);
    assert.equal((await p1).type, 'open');
  });

  it('should return the same opening promise on several open calls (with timeout)', async function () {
    const wsp = createWSP(this.url, {timeout: 50});
    const p1 = wsp.open();
    const p2 = wsp.open();
    assert.equal(p1, p2);
    assert.equal((await p1).type, 'open');
  });

  it('should reject if server rejects connection', async function () {
    const wsp = createWSP(this.url + '?reject=1');
    const p = wsp.open();
    await assert.rejects(p, /WebSocket closed with reason: connection failed \(1006\)/);
  });

  it('should reject after timeout and close connection', async function () {
    const wsp = createWSP(this.url + '?delay=20', {timeout: 10});
    const p = wsp.open();
    await assert.rejects(p, /Can't open WebSocket within allowed timeout: 10 ms/);
  });

  describe('connectionTimeout', function () {
    it('should not reject after timeout if connectionTimeout set', async function () {
      const wsp = createWSP(this.url + '?delay=20', {connectionTimeout: 50, timeout: 10});
      await wsp.open();
      assert.ok(wsp.isOpened);
    });

    it('should reject after connectionTimeout and close connection', async function () {
      const wsp = createWSP(this.url + '?delay=20', {connectionTimeout: 10, timeout: 30});
      const p = wsp.open();
      await assert.rejects(p, /Can't open WebSocket within allowed timeout: 10 ms/);
    });
  });

  it('should reject for invalid url', async function () {
    const wsp = createWSP('abc', {timeout: 10});
    const p = wsp.open();
    await assert.rejects(p, /You must specify a full WebSocket URL, including protocol/);
  });

  it('should resolve with the same promise when opening already opened connection', async function () {
    const p1 = this.wsp.open();
    await p1;
    const p2 = this.wsp.open();
    assert.equal(p1, p2);
  });

  it('should re-open', async function () {
    await this.wsp.open();
    await this.wsp.close();
    const res = await this.wsp.open();
    assert.equal(res.type, 'open');
  });

  it('should trigger onOpen', async function () {
    // need separate wsp instance here
    const wsp = createWSP(this.url);
    const p = new Promise(resolve => wsp.onOpen.addListener(resolve));
    await wsp.open();
    await wsp.close();
    return assert.equal((await p).type, 'open');
  });
});
