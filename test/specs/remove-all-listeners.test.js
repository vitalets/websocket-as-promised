
describe('removeAllListeners', function () {

  it('should remove all listeners', function () {
    const wsp = createWSP('http://foo');

    wsp.onOpen.addListener(noop);
    wsp.onMessage.addListener(noop);
    wsp.onUnpackedMessage.addListener(noop);
    wsp.onResponse.addListener(noop);
    wsp.onSend.addListener(noop);
    wsp.onClose.addListener(noop);
    wsp.onError.addListener(noop);

    wsp.removeAllListeners();

    assert.isNotOk(wsp.onOpen.hasListeners());
    assert.isNotOk(wsp.onMessage.hasListeners());
    assert.isNotOk(wsp.onUnpackedMessage.hasListeners());
    assert.isNotOk(wsp.onResponse.hasListeners());
    assert.isNotOk(wsp.onSend.hasListeners());
    assert.isNotOk(wsp.onClose.hasListeners());
    assert.isNotOk(wsp.onError.hasListeners());
  });

});

