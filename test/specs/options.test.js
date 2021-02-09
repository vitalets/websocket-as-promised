
describe('options', function () {
  it('should throw error for unknown option', function () {
    const fn = () => createWSP(this.url, {foo: 'bar'});
    assert.throws(fn, /Unknown option: foo/);
  });
});
