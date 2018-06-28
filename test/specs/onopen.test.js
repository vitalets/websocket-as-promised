
const {createWSP} = require('../helper');

describe.only('onOpen', function () {
  it('should trigger after connection opened', function () {
    // need separate wsp instance here
    const wsp = createWSP(this.url);
    const res = new Promise(resolve => {
      wsp.onOpen.addListener(resolve);
    });
    wsp.open().then(() => wsp.close());
    return assert.eventually.propertyVal(res, 'type', 'open');
  });
});
