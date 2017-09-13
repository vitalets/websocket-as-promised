
describe('isClosing', function () {
  it('should be initially false', function () {
    assert.isFalse(this.wsp.isClosing);
  });

  it('should be false while opening', function () {
    const p = this.wsp.open();
    assert.isFalse(this.wsp.isClosing);
    return p;
  });

  it('should be false after open', function () {
    const p = this.wsp.open();
    return p.then(() => assert.isFalse(this.wsp.isClosing));
  });

  it('should be true while closing', function () {
    return this.wsp.open().then(() => {
      this.wsp.close();
      assert.isTrue(this.wsp.isClosing);
    });
  });

  it('should be false after close', function () {
    const p = this.wsp.open().then(() => this.wsp.close());
    return p.then(() => assert.isFalse(this.wsp.isClosing));
  });
});
