/**
 * WebSocket with promise api
 */

'use strict';

const Channel = require('chnl');
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
    this._onMessage = new Channel();
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
   * OnMessage channel with `.addListener` / `.removeListener` methods.
   * @see https://github.com/vitalets/chnl
   *
   * @returns {Channel}
   */
  get onMessage() {
    return this._onMessage;
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
      this._ws.addEventListener('open', event => this._handleOpen(event));
      this._ws.addEventListener('message', event => this._handleMessage(event));
      this._ws.addEventListener('error', event => this._handleError(event));
      this._ws.addEventListener('close', event => this._handleClose(event));
    });
  }

  /**
   * Performs request and resolves after response with corresponding `id`.
   *
   * @param {Object} data
   * @param {Object} [options]
   * @param {Number} [options.timeout]
   * @returns {Promise}
   */
  request(data, options) {
    if (!data || typeof data !== 'object') {
      return Promise.reject(new Error(`WebSocket data should be a plain object, got ${data}`));
    }
    const idProp = this._options.idProp;
    const fn = id => {
      data[idProp] = id;
      const dataStr = JSON.stringify(data);
      this._ws.send(dataStr);
    };
    return data[idProp] === undefined
      ? this._pendings.add(fn, options)
      : this._pendings.set(data[idProp], fn, options);
  }

  /**
   * Close WebSocket connection
   *
   * @returns {Promise}
   */
  close() {
    return this._pendings.set(CLOSING_ID, () => this._ws.close());
  }

  _handleOpen(event) {
    this._pendings.resolve(OPENING_ID, event);
  }

  _handleMessage(event) {
    if (event.data) {
      const data = JSON.parse(event.data);
      const id = data && data[this._options.idProp];
      if (id) {
        this._pendings.resolve(id, data);
      }
      this._onMessage.dispatch(data);
    }
  }

  _handleError(event) {
    this._pendings.reject(OPENING_ID, event);
    this._pendings.reject(CLOSING_ID, event);
  }

  _handleClose(event) {
    this._ws = null;
    this._pendings.resolve(CLOSING_ID, event);
    this._pendings.rejectAll(new Error('Connection closed.'));
  }
};
