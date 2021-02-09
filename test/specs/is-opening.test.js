
describe('isOpening', function () {
  it('should be initially false', function () {
    assert.equal(this.wsp.isOpening, false);
  });

  it('should be true while opening', async function () {
    this.wsp.open();
    assert.equal(this.wsp.isOpening, true);
  });

  it('should be false after open', async function () {
    await this.wsp.open();
    assert.equal(this.wsp.isOpening, false);
  });

  it('should be false while closing', async function () {
    await this.wsp.open();
    this.wsp.close();
    assert.equal(this.wsp.isOpening, false);
  });

  it('should be false after close', async function () {
    await this.wsp.open();
    await this.wsp.close();
    assert.equal(this.wsp.isOpening, false);
  });
});
