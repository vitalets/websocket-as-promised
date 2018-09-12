
describe('sendRequest', function () {
  beforeEach(function () {
    this.wsp = createWSP(this.url, this.wspOptionsJson);
  });

  it('should send data and resolve promise after response', function () {
    const res = this.wsp.open().then(() => this.wsp.sendRequest({foo: 'bar'}));
    return Promise.all([
      assert.eventually.propertyVal(res, 'foo', 'bar'),
      assert.eventually.property(res, 'requestId')
    ]);
  });

  it('should reject if sending without open', function () {
    const p = this.wsp.sendRequest({foo: 'bar'});
    return assert.isRejected(p, `Can't send data because WebSocket is not opened.`);
  });

  it('should throw if attachRequestId is not defined', function () {
    const wsp = createWSP(this.url, Object.assign({}, this.wspOptionsJson, {attachRequestId: null}));
    const p = wsp.open().then(() => wsp.sendRequest({foo: 'bar'}));
    return assert.isRejected(p,
      `Please define 'options.attachRequestId / options.extractRequestId' for sending requests.`
    );
  });

  it('should throw if extractRequestId is not defined', function () {
    const wsp = createWSP(this.url, Object.assign({}, this.wspOptionsJson, {extractRequestId: null}));
    const p = wsp.open().then(() => wsp.sendRequest({foo: 'bar'}));
    return assert.isRejected(p,
      `Please define 'options.attachRequestId / options.extractRequestId' for sending requests.`
    );
  });

  it('should send binary data', function () {
    const wsp = createWSP(this.url, {
      packMessage: data => (new Uint8Array(data)).buffer,
      unpackMessage: message => new Uint8Array(message),
      attachRequestId: (data, requestId) => [requestId].concat(data), // requestId in the first position
      extractRequestId: data => data[0],
    });
    const p = wsp.open().then(() => wsp.sendRequest([42], {requestId: 1}));
    return assert.isFulfilled(p).then(res => assert.equal(String(res), '1,42'));
  });

  it('should allow to set requestId', function () {
    const res = this.wsp.open()
      .then(() => this.wsp.sendRequest({foo: 'bar'}, {requestId: '1'}));
    return assert.eventually.propertyVal(res, 'requestId', '1');
  });

  it('should reject request if another request with the same requestId is pending', function () {
    let p1;
    const res = this.wsp.open()
      .then(() => {
        p1 = this.wsp.sendRequest({noResponse: true}, {requestId: '1'});
        p1.catch(noop);
      })
      .then(() => this.wsp.sendRequest({}, {requestId: '1'}));
    return assert.isFulfilled(res).then(() => assert.isRejected(p1));
  });

  it('should trigger onResponse with response data', function () {
    let response;
    this.wsp.onResponse.addListener((data, requestId) => response = {data, requestId});
    const p = this.wsp.open()
      .then(() => this.wsp.sendRequest({foo: 'bar'}, {requestId: 1}))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => assert.deepEqual(response, {data: {foo: 'bar', requestId: 1}, requestId: 1}));
  });

  describe('timeout', function () {
    it('should reject after timeout', function () {
      const wsp = createWSP(this.url, Object.assign({timeout: 100}, this.wspOptionsJson));
      const res = wsp.open().then(() => wsp.sendRequest({foo: 'bar', delay: 200}));
      return assert.isRejected(res)
        .then(e => assert.match(e.message, /^WebSocket request was rejected by timeout \(100 ms\)/));
    });

    it('should resolve request before timeout', function () {
      const wsp = createWSP(this.url, Object.assign({timeout: 100}, this.wspOptionsJson));
      const res = wsp.open().then(() => wsp.sendRequest({foo: 'bar', delay: 50}));
      return assert.eventually.propertyVal(res, 'foo', 'bar');
    });

    it('should reject after custom timeout', function () {
      const wsp = createWSP(this.url, Object.assign({timeout: 100}, this.wspOptionsJson));
      const requestOptions = {timeout: 50};
      const res = wsp.open().then(() => wsp.sendRequest({foo: 'bar', delay: 70}, requestOptions));
      return assert.isRejected(res)
        .then(e => assert.match(e.message, /^WebSocket request was rejected by timeout \(50 ms\)/));
    });
  });

});

