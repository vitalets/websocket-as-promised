//
// const {createWSP} = require('../helper');
//
// describe.skip('onMessage', function () {
//   it('should dispatch data and jsonData after json response', function () {
//     const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
//     const res = new Promise(resolve => {
//       wsp.onMessage.addListener((jsonData, data) => resolve({jsonData, data}));
//       wsp.open().then(() => wsp.sendRequest({foo: 'bar'}));
//     });
//     return assert.isFulfilled(res).then(r => {
//       assert.include(r.data, '"foo":"bar"');
//       assert.propertyVal(r.jsonData, 'foo', 'bar');
//     });
//   });
//
//   it('should dispatch data and jsonData=undefined after non-json response', function () {
//     const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
//     const res = new Promise(resolve => {
//       wsp.onMessage.addListener((jsonData, data) => resolve({jsonData, data}));
//       wsp.open().then(() => wsp.sendRequest({nonJSONResponse: true})).catch(() => {});
//     });
//     return assert.isFulfilled(res).then(r => {
//       assert.include(r.data, 'non JSON response');
//       assert.equal(r.jsonData, undefined);
//     });
//   });
//
//   // todo: find way to write this test. Currently it fails because mocha listens window.onerror
//   it.skip('should dispatch data after string request', function () {
//     const wsp = new WebSocketAsPromised(this.url, {createWebSocket});
//     const res = new Promise(resolve => {
//       wsp.onMessage.addListener(resolve);
//       wsp.open().then(() => wsp.sendRequest({nonJSONResponse: true})).catch(() => {});
//     });
//     return assert.eventually.propertyVal(res, 'foo', 'bar');
//   });
// });
