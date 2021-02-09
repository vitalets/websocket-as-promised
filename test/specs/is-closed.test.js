
describe('isClosed', function () {
  it('should be initially true', function () {
    assert.equal(this.wsp.isClosed, true);
  });

  it('should be false while opening', async function () {
    this.wsp.open();
    assert.equal(this.wsp.isClosed, false);
  });

  it('should be false after open', async function () {
    await this.wsp.open();
    assert.equal(this.wsp.isClosed, false);
  });

  it('should be false while closing', async function () {
    await this.wsp.open();
    this.wsp.close();
    assert.equal(this.wsp.isClosed, false);
  });

  it('should be true after close', async function () {
    await this.wsp.open();
    await this.wsp.close();
    assert.equal(this.wsp.isClosed, true);
  });
});
