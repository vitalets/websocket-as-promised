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
   * @param {Object} [options]
   * @param {String} [options.idProp="id"] id property name attached to each message
   * @param {Object} [options.WebSocket=WebSocket] custom WebSocket constructor
   */
  constructor(options) {
    options = options || {};
    this._idProp = options.idProp || 'id';
    this._WebSocket = options.WebSocket || WebSocket;
    this._pendings = new Pendings();
    this._ws = null;
  }

  /**
   * Returns raw WebSocket instance
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
      if (data[this._idProp] !== undefined) {
        throw new Error(`WebSocket data should not contain system property: ${this._idProp}`);
      }
      data[this._idProp] = id;
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
      const id = data && data[this._idProp];
      if (id) {
        this._pendings.resolve(id, data);
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
    this._pendings.rejectAll(new Error('Connection closed.'));
  }
};
