
describe('onError', function () {

  it('should trigger for incorrect urls', function (done) {
    const wsp = createWSP('http://foo');
    const res = new Promise(resolve => {
      wsp.onError.addListener(resolve);
      wsp.open().catch(noop);
    });
    assert.eventually.propertyVal(res, 'type', 'error');
    done();
  });

  // todo: how to make error from server side?
  it('should trigger by server error');

});

