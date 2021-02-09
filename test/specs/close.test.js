
const NORMAL_CLOSE_CODE = 1000;

describe('close', function () {
  it('should close connection', async function () {
    await this.wsp.open();
    const res = await this.wsp.close();

    assert.equal(res.code, NORMAL_CLOSE_CODE);
  });

  it('should close connection with custom code', async function () {
    await this.wsp.open();
    const res = await this.wsp.close(3000, 'custom reason');

    assert.equal(res.code, 3000);
    assert.equal(res.reason, 'custom reason');
  });

  it('should return the same closing promise for several calls while closing', async function () {
    await this.wsp.open();

    const p1 = this.wsp.close();
    const p2 = this.wsp.close();

    assert.equal(p1, p2);
    assert.equal((await p2).code, NORMAL_CLOSE_CODE);
  });

  it('should return the same closing promise for several close calls (with timeout)', async function () {
    const wsp = createWSP(this.url, {timeout: 50});
    await wsp.open();

    const p1 = wsp.close();
    const p2 = wsp.close();

    assert.equal(p1, p2);
    assert.equal((await p2).code, NORMAL_CLOSE_CODE);
  });

  it('should resolve with the same event for already closed connection', async function () {
    await this.wsp.open();

    const res1 = await this.wsp.close();
    const res2 = await this.wsp.close();

    assert.equal(res1.code, res2.code);
  });

  it('should resolve with undefined for not-opened connection', async function () {
    const res = await this.wsp.close();

    assert.equal(res, undefined);
  });

  it('should reject all pending requests', async function () {
    const wsp = createWSP(this.url, this.wspOptionsJson);
    const a = [];
    await wsp.open();

    wsp.sendRequest({noResponse: true}).catch(e => a.push(e.message));
    wsp.sendRequest({noResponse: true}).catch(e => a.push(e.message));

    await wait(10); // need this tiny delay, as otherwise server hangs on getting 2 requests and closing simultaneously
    await wsp.close();
    await wait(10); // need this tiny delay to reject all responses

    assert.deepEqual(a, [
      'WebSocket closed with reason: Normal connection closure (1000).',
      'WebSocket closed with reason: Normal connection closure (1000).',
    ]);
  });

  it('should trigger onClose (initiated by client)', async function () {
    const wsp = createWSP(this.url);
    const promise = new Promise(resolve => wsp.onClose.addListener(resolve));

    await wsp.open();
    await wsp.close();

    assert.equal((await promise).code, NORMAL_CLOSE_CODE);
  });

  describe('by server', function () {
    it('should reject request', async function () {
      const wsp = createWSP(this.url, this.wspOptionsJson);
      await wsp.open();

      const promise = wsp.sendRequest({
        close: true,
        code: 1009,
        reason: 'Message is too big'
      });

      await assert.rejects(promise, /Message is too big/);
    });

    it('should reject for drop', async function () {
      const wsp = createWSP(this.url, this.wspOptionsJson);
      await wsp.open();

      const promise = wsp.sendRequest({drop: true});

      await assert.rejects(promise, /WebSocket closed/);
    });

    it('should trigger onClose', async function () {
      const wsp = createWSP(this.url);
      const promise = new Promise(resolve => wsp.onClose.addListener(resolve));
      await wsp.open();

      wsp.send(JSON.stringify({close: true, code: 1009}));

      assert.equal((await promise).code, 1009);
    });
  });
});

