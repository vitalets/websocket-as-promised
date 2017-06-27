/**
 * WebSocket with promise api
 */

'use strict';

const Pendings = require('pendings');

const OPENING_ID = 'open';
const CLOSING_ID = 'close';

const DEFAULT_OPTIONS = {
  idProp: 'id',
  timeout: 0,
  WebSocket: typeof WebSocket !== 'undefined' ? WebSocket : null,
};

module.exports = class WebSocketAsPromised {
  /**
   * Constructor
   *
   * @param {Object} [options]
   * @param {String} [options.idProp="id"] id property name attached to each message
   * @param {Object} [options.timeout=0] default timeout for requests
   * @param {Object} [options.WebSocket=WebSocket] custom WebSocket constructor
   */
  constructor(options) {
    this._options = Object.assign({}, DEFAULT_OPTIONS, options);
    this._pendings = new Pendings({timeout: this._options.timeout});
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
      this._ws = new this._options.WebSocket(url);
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
    const idProp = this._options.idProp;
    return this._pendings.add(id => {
      if (!data || typeof data !== 'object') {
        throw new Error(`WebSocket data should be a plain object, got ${data}`);
      }
      if (data[idProp] !== undefined) {
        throw new Error(`WebSocket data should not contain system property: ${idProp}`);
      }
      data[idProp] = id;
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
      const id = data && data[this._options.idProp];
      if (id) {
        this._pendings.resolve(id, data);
      }
    }
  }

  _onError(event) {
    this._pendings.reject(OPENING_ID, event);
    this._pendings.reject(CLOSING_ID, event);
  }

  _onClose(event) {
    this._ws = null;
    this._pendings.resolve(CLOSING_ID, event);
    this._pendings.rejectAll(new Error('Connection closed.'));
  }
};
