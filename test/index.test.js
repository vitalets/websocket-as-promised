'use strict';

const W3CWebSocket = require('websocket').w3cwebsocket;
const assert = require('chai').assert;
const WebSocketAsPromised = require('../src');
const server = require('./server');

describe('WebSocketAsPromised', function () {

  before(function (done) {
    server.start(url => {
      this.url = url;
      done();
    });
  });

  after(function (done) {
    server.stop(() => done());
  });

  beforeEach(function () {
    this.wsp = new WebSocketAsPromised(W3CWebSocket);
  });

  afterEach(function () {
    if (this.wsp.ws) {
      return this.wsp.close();
    }
  });

  it('should open connection', function () {
    return this.wsp.open(this.url)
      .then(event => assert.equal(event.type, 'open'));
  });

  it('should send and receive data with id', function () {
    return this.wsp.open(this.url)
      .then(() => this.wsp.send({foo: 'bar'}))
      .then(data => {
        assert.equal(data.foo, 'bar');
        assert.property(data, 'id');
      });
  });

  it('should close connection', function () {
    return this.wsp.open(this.url)
      .then(() => this.wsp.close())
      .then(event => assert.equal(event.code, 1000));
  });
});
