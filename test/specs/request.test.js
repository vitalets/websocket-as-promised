//
// const {createWSP} = require('../helper');
//
// describe.skip('request', function () {
//   it('should resolve promise after response', function () {
//     const res = this.wsp.open().then(() => this.wsp.request({foo: 'bar'}));
//     return Promise.all([
//       assert.eventually.propertyVal(res, 'foo', 'bar'),
//       assert.eventually.property(res, 'id')
//     ]);
//   });
//
//   it('should allow to set id manually', function () {
//     const res = this.wsp.open().then(() => this.wsp.request({foo: 'bar', id: 1}));
//     return assert.eventually.propertyVal(res, 'id', 1);
//   });
//
//   it('should not fulfill for response without ID', function () {
//     let a = 0;
//     const res = this.wsp.open()
//       .then(() => {
//         this.wsp.request({noId: true}).then(() => a = a + 1, () => {
//         });
//         return wait(100).then(() => a);
//       });
//     return assert.eventually.equal(res, 0);
//   });
// });
//
// describe.skip('request timeout', function () {
//   it('should reject after timeout', function () {
//     const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 50});
//     const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 100}));
//     return assert.isRejected(res, 'Request rejected by timeout (50 ms)');
//   });
//
//   it('should request before timeout', function () {
//     const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 100});
//     const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 50}));
//     return assert.eventually.propertyVal(res, 'foo', 'bar');
//   });
//
//   it('should reject after custom timeout', function () {
//     const wsp = new WebSocketAsPromised(this.url, {createWebSocket, timeout: 100});
//     const options = {timeout: 50};
//     const res = wsp.open().then(() => wsp.request({foo: 'bar', delay: 70}, options));
//     return assert.isRejected(res, 'Request rejected by timeout (50 ms)');
//   });
// });
