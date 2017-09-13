
const {createWSP, NORMAL_CLOSE_CODE} = require('../helper');

describe('onClose', function () {
  it('should trigger after client close', function () {
    // need separate wsp instance here
    const wsp = createWSP(this.url);
    const res = new Promise(resolve => {
      wsp.onClose.addListener(resolve);
      wsp.open().then(() => wsp.close());
    });
    return assert.eventually.propertyVal(res, 'code', NORMAL_CLOSE_CODE);
  });

  it('should trigger after server close', function () {
    // need separate wsp instance here
    const wsp = createWSP(this.url);
    const res = new Promise(resolve => {
      wsp.onClose.addListener(resolve);
      wsp.open().then(() => wsp.request({close: true, code: 1009})).catch(noop);
    });
    return assert.eventually.propertyVal(res, 'code', 1009);
  });
});
