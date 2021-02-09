
describe('sendRequest', function () {
  beforeEach(function () {
    this.wsp = createWSP(this.url, this.wspOptionsJson);
  });

  it('should send data and resolve promise after response', async function () {
    await this.wsp.open();
    const res = await this.wsp.sendRequest({foo: 'bar'});
    assert.equal(res.foo, 'bar');
    assert.ok(res.requestId);
  });

  it('should reject if sending without open', async function () {
    const p = this.wsp.sendRequest({foo: 'bar'});
    await assert.rejects(p, /Can't send data because WebSocket is not opened/);
  });

  it('should throw if attachRequestId is not defined', async function () {
    const wsp = createWSP(this.url, {
      ...this.wspOptionsJson,
      attachRequestId: null
    });
    await wsp.open();
    const p = wsp.sendRequest({foo: 'bar'});
    await assert.rejects(p,
      /Please define 'options.attachRequestId \/ options.extractRequestId' for sending requests/
    );
  });

  it('should throw if extractRequestId is not defined', async function () {
    const wsp = createWSP(this.url, {
      ...this.wspOptionsJson,
      extractRequestId: null
    });
    await wsp.open();
    const p = wsp.sendRequest({foo: 'bar'});
    await assert.rejects(p,
      /Please define 'options.attachRequestId \/ options.extractRequestId' for sending requests/
    );
  });

  it('should send binary data', async function () {
    const wsp = createWSP(this.url, {
      packMessage: data => (new Uint8Array(data)).buffer,
      unpackMessage: message => new Uint8Array(message),
      attachRequestId: (data, requestId) => [requestId].concat(data), // requestId in the first position
      extractRequestId: data => data[0],
    });
    await wsp.open();
    const res = await wsp.sendRequest([42], {requestId: 1});
    assert.equal(String(res), '1,42');
  });

  it('should allow to set requestId', async function () {
    await this.wsp.open();
    const res = await this.wsp.sendRequest({foo: 'bar'}, {requestId: '1'});
    return assert.equal(res.requestId, '1');
  });

  it('should reject request if another request with the same requestId is pending', async function () {
    await this.wsp.open();
    const p1 = this.wsp.sendRequest({noResponse: true}, {requestId: '1'});
    p1.catch(noop);
    const p2 = this.wsp.sendRequest({foo: 'bar'}, {requestId: '1'});
    await assert.rejects(p1);
    assert.equal((await p2).foo, 'bar');
  });

  it('should trigger onResponse with response data', async function () {
    await this.wsp.open();
    const p = new Promise(resolve => this.wsp.onResponse.addListener((data, requestId) => resolve({data, requestId})));
    this.wsp.sendRequest({foo: 'bar'}, {requestId: 1});
    assert.deepEqual(await p, {
      data: {
        foo: 'bar',
        requestId: 1
      },
      requestId: 1
    });
  });

  describe('timeout', function () {

    it('should reject after timeout', async function () {
      const wsp = createWSP(this.url, {
        ...this.wspOptionsJson,
        timeout: 100
      });
      await wsp.open();
      const p = wsp.sendRequest({foo: 'bar', delay: 200});
      await assert.rejects(p, /WebSocket request was rejected by timeout \(100 ms\)/);
    });

    it('should resolve request before timeout', async function () {
      const wsp = createWSP(this.url, {
        ...this.wspOptionsJson,
        timeout: 100
      });
      await wsp.open();
      const p = wsp.sendRequest({foo: 'bar', delay: 50});
      assert.equal((await p).foo, 'bar');
    });

    it('should reject after custom timeout', async function () {
      const wsp = createWSP(this.url, {
        ...this.wspOptionsJson,
        timeout: 100
      });
      await wsp.open();
      const p = wsp.sendRequest({foo: 'bar', delay: 70}, {timeout: 50});
      await assert.rejects(p, /WebSocket request was rejected by timeout \(50 ms\)/);
    });
  });

});

