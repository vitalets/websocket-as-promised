
describe('isOpened', function () {
  it('should be initially false', function () {
    assert.equal(this.wsp.isOpened, false);
  });

  it('should be false while opening', async function () {
    this.wsp.open();
    assert.equal(this.wsp.isOpened, false);
  });

  it('should be true after open', async function () {
    await this.wsp.open();
    assert.equal(this.wsp.isOpened, true);
  });

  it('should be false while closing', async function () {
    await this.wsp.open();
    this.wsp.close();
    assert.equal(this.wsp.isOpened, false);
  });

  it('should be false after close', async function () {
    await this.wsp.open();
    await this.wsp.close();
    assert.equal(this.wsp.isOpened, false);
  });
});
