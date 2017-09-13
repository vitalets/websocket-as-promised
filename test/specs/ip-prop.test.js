
const {createWSP} = require('../helper');

describe('idProp', function () {
  it('should be customized by options', function () {
    const wsp = new WebSocketAsPromised(this.url, {createWebSocket, idProp: 'myId'});
    const res = wsp.open().then(() => wsp.request({foo: 'bar'}));
    return Promise.all([
      assert.eventually.propertyVal(res, 'foo', 'bar'),
      assert.eventually.property(res, 'myId'),
    ]);
  });

  it('should not overwrite if options.idProp is undefined', function () {
    const wsp = new WebSocketAsPromised(this.url, {createWebSocket, idProp: undefined});
    const res = wsp.open().then(() => wsp.request({foo: 'bar'}));
    return Promise.all([
      assert.eventually.propertyVal(res, 'foo', 'bar'),
      assert.eventually.property(res, 'id'),
    ]);
  });
});
