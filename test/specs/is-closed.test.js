
const {createWSP} = require('../helper');

describe('isClosed', function () {
  it('should be initially true', function () {
    assert.isTrue(this.wsp.isClosed);
  });

  it('should be false while opening and after open', function () {
    const p = this.wsp.open();
    assert.isFalse(this.wsp.isClosed);
    return p.then(() => assert.isFalse(this.wsp.isClosed));
  });

  it('should be true after close', function () {
    const p = this.wsp.open().then(() => {
      const p1 = this.wsp.close();
      assert.isFalse(this.wsp.isClosed);
      return p1;
    });
    return p.then(() => assert.isTrue(this.wsp.isClosed));
  });
});
