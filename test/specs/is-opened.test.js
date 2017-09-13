
describe('isOpened', function () {
  it('should be initially false', function () {
    assert.isFalse(this.wsp.isOpened);
  });

  it('should be false while opening', function () {
    const p = this.wsp.open();
    assert.isFalse(this.wsp.isOpened);
    return p;
  });

  it('should be true after open', function () {
    const p = this.wsp.open();
    return p.then(() => assert.isTrue(this.wsp.isOpened));
  });

  it('should be false while closing', function () {
    return this.wsp.open().then(() => {
      this.wsp.close();
      assert.isFalse(this.wsp.isOpened);
    });
  });

  it('should be false after close', function () {
    const p = this.wsp.open().then(() => this.wsp.close());
    return p.then(() => assert.isFalse(this.wsp.isOpened));
  });
});
