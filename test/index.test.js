'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const W3CWebSocket = require('websocket').w3cwebsocket;
const WebSocketAsPromised = require('../src');
const server = require('./server');

chai.use(chaiAsPromised);
const assert = chai.assert;

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
    this.wsp = new WebSocketAsPromised({WebSocket: W3CWebSocket});
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
    const CLOSE_NORMAL = 1000;
    return this.wsp.open(this.url)
      .then(() => this.wsp.close())
      .then(event => assert.equal(event.code, CLOSE_NORMAL));
  });

  it('should reject for invalid url', function () {
    const res = this.wsp.open('abc');
    return assert.isRejected(res, 'You must specify a full WebSocket URL, including protocol.');
  });

  it('should customize idProp', function () {
    this.wsp = new WebSocketAsPromised({WebSocket: W3CWebSocket, idProp: 'myId'});
    return this.wsp.open(this.url)
      .then(() => this.wsp.send({foo: 'bar'}))
      .then(data => {
        assert.equal(data.foo, 'bar');
        assert.property(data, 'myId');
      });
  });
});
