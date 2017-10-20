
describe('send', function () {
  it('should send json and does not return promise', function () {
    let result, response;
    this.wsp.onMessage.addListener(data => response = data);
    const p = this.wsp.open()
      .then(() => result = this.wsp.send({foo: 'bar'}))
      .then(() => wait(100));
    return assert.isFulfilled(p)
      .then(() => {
        assert.equal(result, undefined);
        assert.deepEqual(response, {foo: 'bar'});
      });
  });

  it('should throw if sending without open', function () {
    return assert.throws(() => this.wsp.send({foo: 'bar'}), 'Can not send data because WebSocket is not opened.');
  });
});
