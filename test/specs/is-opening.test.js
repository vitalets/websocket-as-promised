
const {createWSP} = require('../helper');

describe('isOpening', function () {
  it('should be initially false', function () {
    assert.isFalse(this.wsp.isOpening);
  });

  it('should be true while opening', function () {
    const p = this.wsp.open();
    assert.isTrue(this.wsp.isOpening);
    return p.then(() => assert.isFalse(this.wsp.isOpening));
  });

  it('should be false when closing and close', function () {
    const p = this.wsp.open().then(() => {
      const p1 = this.wsp.close();
      assert.isFalse(this.wsp.isOpening);
      return p1;
    });
    return p.then(() => assert.isFalse(this.wsp.isOpening));
  });
});
