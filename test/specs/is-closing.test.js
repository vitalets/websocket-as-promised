
const {createWSP} = require('../helper');

describe('isClosing', function () {
  it('should be initially false', function () {
    assert.isFalse(this.wsp.isClosing);
  });

  it('should be false while opening and after open', function () {
    const p = this.wsp.open();
    assert.isFalse(this.wsp.isClosing);
    return p.then(() => assert.isFalse(this.wsp.isClosing));
  });

  it('should be true while closing', function () {
    const p = this.wsp.open().then(() => {
      const p1 = this.wsp.close();
      assert.isTrue(this.wsp.isClosing);
      return p1;
    });
    return p.then(() => assert.isFalse(this.wsp.isClosing));
  });
});
