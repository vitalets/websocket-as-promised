
describe('isOpening', function () {
  it('should be initially false', function () {
    assert.isFalse(this.wsp.isOpening);
  });

  it('should be true while opening', function () {
    const p = this.wsp.open();
    assert.isTrue(this.wsp.isOpening);
    return p.then(() => assert.isFalse(this.wsp.isOpening));
  });

  it('should be false after open', function () {
    const p = this.wsp.open();
    return p.then(() => assert.isFalse(this.wsp.isOpening));
  });

  it('should be false while closing', function () {
    return this.wsp.open().then(() => {
      this.wsp.close();
      assert.isFalse(this.wsp.isOpening);
    });
  });

  it('should be false after close', function () {
    const p = this.wsp.open().then(() => this.wsp.close());
    return p.then(() => assert.isFalse(this.wsp.isOpening));
  });
});
