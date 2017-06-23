/**
 * WebSocket with promise api
 */

'use strict';

const Pendings = require('pendings');

const OPENING_ID = 'open';
const CLOSING_ID = 'close';

module.exports = class WebSocketAsPromised {
  /**
   * Constructor
   *
   * @param {Object} [CustomWebSocket] custom WebSocket constructor. By default, `window.WebSocket`
   */
  constructor(CustomWebSocket) {
    this._WebSocket = CustomWebSocket || WebSocket;
    this._ws = null;
    this._pendings = new Pendings();
  }

  /**
   * Get WebSocket instance
   *
   * @returns {WebSocket}
   */
  get ws() {
    return this._ws;
  }

  /**
   * Open WebSocket connection
   *
   * @param {String} url
   * @returns {Promise}
   */
  open(url) {
    return this._pendings.set(OPENING_ID, () => {
      this._ws = new this._WebSocket(url);
      this._ws.addEventListener('open', event => this._onOpen(event));
      this._ws.addEventListener('message', event => this._onMessage(event));
      this._ws.addEventListener('error', event => this._onError(event));
      this._ws.addEventListener('close', event => this._onClose(event));
    });
  }

  /**
   * Send data and wait for response containing `id` property
   *
   * @param {Object} data
   * @returns {Promise}
   */
  send(data) {
    return this._pendings.add(id => {
      if (!data || typeof data !== 'object') {
        throw new Error(`WebSocket data should be a plain object, got ${data}`);
      }
      data.id = id;
      const dataStr = JSON.stringify(data);
      this._ws.send(dataStr);
    });
  }

  /**
   * Close WebSocket connection
   *
   * @returns {Promise}
   */
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
