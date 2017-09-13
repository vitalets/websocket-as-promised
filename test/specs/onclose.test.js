
const {createWSP} = require('../helper');

describe('onClose', function () {
  it('should trigger after client close', function () {
    const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
    const res = new Promise(resolve => {
      wsp.onClose.addListener(resolve);
      wsp.open().then(() => wsp.close());
    });
    return assert.eventually.propertyVal(res, 'code', 1000);
  });

  it('should trigger after server close', function () {
    const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
    const res = new Promise(resolve => {
      wsp.onClose.addListener(resolve);
      wsp.open().then(() => wsp.request({close: true, code: 1009})).catch(() => {});
    });
    return assert.eventually.propertyVal(res, 'code', 1009);
  });
});
