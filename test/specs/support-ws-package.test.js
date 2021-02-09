
const WebSocket = require('ws');

describe('support ws package', function () {

  it('should send and receive messages', async function () {
    const wsp = createWSP(this.url, {
      createWebSocket: url => new WebSocket(url),
      extractMessageData: event => event,
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),
    });
    await wsp.open();
    const p = new Promise(resolve => wsp.onUnpackedMessage.addListener(data => resolve(data)));
    wsp.sendPacked({foo: 'bar'});
    assert.deepEqual(await p, {foo: 'bar'});
  });

});
