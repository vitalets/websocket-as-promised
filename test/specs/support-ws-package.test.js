
const WebSocket = require('ws');

describe('support ws package', function () {

  it('should send and receive messages', function () {
    this.wsp = createWSP(this.url, {
      createWebSocket: url => new WebSocket(url),
      extractMessageData: event => event,
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),
    });

    let response;
    this.wsp.onUnpackedMessage.addListener(data => response = data);
    const p = this.wsp.open()
      .then(() => this.wsp.sendPacked({foo: 'bar'}))
      .then(() => wait(100));

    return assert.isFulfilled(p)
      .then(() => assert.deepEqual(response, {foo: 'bar'}));
  });

});
