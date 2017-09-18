
const {createWSP} = require('../helper');

// todo: create plain-defaults package that will throw on unknown options
describe.skip('options', function () {
  it('should throw error for unknown option', function () {
    const fn = () => createWSP(this.url, {foo: 'bar'});
    assert.throws(fn, 'unknown option "foo"');
  });
});
