
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

    assert.equal(wsp.onOpen.hasListeners(), false, 'onOpen');
    assert.equal(wsp.onMessage.hasListeners(), false, 'onMessage');
    assert.equal(wsp.onUnpackedMessage.hasListeners(), false, 'onUnpackedMessage');
    assert.equal(wsp.onResponse.hasListeners(), false, 'onResponse');
    assert.equal(wsp.onSend.hasListeners(), false, 'onSend');
    assert.equal(wsp.onClose.hasListeners(), false, 'onClose');
    assert.equal(wsp.onError.hasListeners(), false, 'onError');
  });

});

