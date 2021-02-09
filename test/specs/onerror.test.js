
describe('onError', function () {

  it('should trigger for incorrect urls', async function () {
    // on windows this test takes more time
    // see https://github.com/vitalets/websocket-as-promised/pull/16
    this.timeout(5 * 1000);
    const wsp = createWSP('http://foo');
    const p = new Promise(resolve => wsp.onError.addListener(resolve));
    wsp.open().catch(noop);
    return assert.equal((await p).type, 'error');
  });

  // todo: how to make error from server side?
  it('should trigger by server error');

});

