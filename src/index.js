/**
 * WebSocket with promise api
 */

'use strict';

const Pendings = require('pendings');

const OPENING_ID = 'open';
const CLOSING_ID = 'close';

module.exports = class WebSocketAsPromised {
  constructor(CustomWebSocket) {
    this._WebSocket = CustomWebSocket || WebSocket;
    this._ws = null;
    this._pendings = new Pendings();
  }
  get ws() {
    return this._ws;
  }
  open(url) {
    return this._pendings.set(OPENING_ID, () => {
      this._ws = new this._WebSocket(url);
      this._ws.onopen = event => this._onOpen(event);
      this._ws.onmessage = event => this._onMessage(event);
      this._ws.onerror = event => this._onError(event);
      this._ws.onclose = event => this._onClose(event);
    });
  }
  send(data = {}) {
    return this._pendings.add(id => {
      if (!data || typeof data !== 'object') {
        throw new Error(`WebSocket data should be a plain object, got ${data}`);
      }
      data.id = id;
      const dataStr = JSON.stringify(data);
      this._ws.send(dataStr);
    });
  }
  close() {
    return this._pendings.set(CLOSING_ID, () => this._ws.close());
  }
  _onOpen(event) {
    this._pendings.resolve(OPENING_ID, event);
  }
  _onMessage(event) {
    if (event.data) {
      const data = JSON.parse(event.data);
      if (data && data.id && this._pendings.has(data.id)) {
        this._pendings.resolve(data.id, data);
      }
    }
  }
  _onError(event) {
    if (this._pendings.has(OPENING_ID)) {
      this._pendings.reject(OPENING_ID, event);
    }
    if (this._pendings.has(CLOSING_ID)) {
      this._pendings.reject(CLOSING_ID, event);
    }
  }
  _onClose(event) {
    this._ws = null;
    if (this._pendings.has(CLOSING_ID)) {
      this._pendings.resolve(CLOSING_ID, event);
    }
  }
};
