
describe('isClosed', function () {
  it('should be initially true', function () {
    assert.isTrue(this.wsp.isClosed);
  });

  it('should be false while opening', function () {
    const p = this.wsp.open();
    assert.isFalse(this.wsp.isClosed);
    return p;
  });

  it('should be false after open', function () {
    const p = this.wsp.open();
    return p.then(() => assert.isFalse(this.wsp.isClosed));
  });

  it('should be false while closing', function () {
    return this.wsp.open().then(() => {
      this.wsp.close();
      assert.isFalse(this.wsp.isClosed);
    });
  });

  it('should be true after close', function () {
    const p = this.wsp.open().then(() => this.wsp.close());
    return p.then(() => assert.isTrue(this.wsp.isClosed));
  });
});
