
const {createWSP} = require('../helper');

describe('isOpened', function () {
  it('should be initially false', function () {
    assert.isFalse(this.wsp.isOpened);
  });

  it('should be true after open', function () {
    const p = this.wsp.open();
    assert.isFalse(this.wsp.isOpened);
    return p.then(() => assert.isTrue(this.wsp.isOpened));
  });

  it('should be false when closing and after close', function () {
    const p = this.wsp.open().then(() => {
      const p1 = this.wsp.close();
      assert.isFalse(this.wsp.isOpened);
      return p1;
    });
    return p.then(() => assert.isFalse(this.wsp.isOpened));
  });
});
