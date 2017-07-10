/**
 * WebSocket with promise api
 */

/**
 * @external Channel
 */

const Channel = require('chnl');
const Pendings = require('pendings');
const utils = require('./utils');

const OPENING_ID = 'open';
const CLOSING_ID = 'close';

const DEFAULT_OPTIONS = {
  createWebSocket: url => new WebSocket(url),
  idProp: 'id',
  timeout: 0,
};

// see: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Ready_state_constants
const STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

/**
 * @typicalname wsp
 */
class WebSocketAsPromised {
  /**
   * Constructor
   *
   * @param {Object} [options]
   * @param {Function} [options.createWebSocket=url => new Websocket(url)] custom WebSocket creation method
   * @param {String} [options.idProp="id"] id property name attached to each message
   * @param {Number} [options.timeout=0] default timeout for requests
   */
  constructor(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, utils.removeUndefined(options));
    this._idProp = options.idProp;
    this._createWebSocket = options.createWebSocket;
    this._pendings = new Pendings({timeout: options.timeout});
    this._onMessage = new Channel();
    this._ws = null;
  }

  /**
   * Returns original WebSocket instance created by `options.createWebSocket`.
   *
   * @returns {WebSocket}
   */
  get ws() {
    return this._ws;
  }

  /**
   * Is WebSocket in connecting state.
   *
   * @returns {Boolean}
   */
  get isConnecting() {
    return Boolean(this._ws && this._ws.readyState === STATE.CONNECTING);
  }

  /**
   * Is WebSocket connected.
   *
   * @returns {Boolean}
   */
  get isConnected() {
    return Boolean(this._ws && this._ws.readyState === STATE.OPEN);
  }

  /**
   * Is WebSocket in disconnecting state.
   *
   * @returns {Boolean}
   */
  get isDisconnecting() {
    return Boolean(this._ws && this._ws.readyState === STATE.CLOSING);
  }

  /**
   * Is WebSocket disconnected.
   *
   * @returns {Boolean}
   */
  get isDisconnected() {
    return Boolean(!this._ws || this._ws.readyState === STATE.CLOSED);
  }

  /**
   * OnMessage channel with `.addListener` / `.removeListener` methods.
   * @see https://vitalets.github.io/chnl/#channel
   *
   * @returns {Channel}
   */
  get onMessage() {
    return this._onMessage;
  }

  /**
   * Opens WebSocket connection.
   *
   * @param {String} url
   * @returns {Promise}
   */
  open(url) {
    return this._pendings.set(OPENING_ID, () => {
      this._ws = this._createWebSocket(url);
      this._ws.addEventListener('open', event => this._handleOpen(event));
      this._ws.addEventListener('message', event => this._handleMessage(event));
      this._ws.addEventListener('error', event => this._handleError(event));
      this._ws.addEventListener('close', event => this._handleClose(event));
    });
  }

  /**
   * Performs JSON request and waits for response.
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
    const fn = id => {
      data[this._idProp] = id;
      this.sendJson(data);
    };
    return data[this._idProp] === undefined
      ? this._pendings.add(fn, options)
      : this._pendings.set(data[this._idProp], fn, options);
  }

  /**
   * Sends JSON data and does not wait for response.
   *
   * @param {Object} data
   */
  sendJson(data) {
    const dataStr = JSON.stringify(data);
    this._ws.send(dataStr);
  }

  /**
   * Sends any WebSocket compatible data.
   *
   * @param {String|ArrayBuffer|Blob} data
   */
  send(data) {
    this._ws.send(data);
  }

  /**
   * Closes WebSocket connection.
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
      const id = data && data[this._idProp];
      this._pendings.tryResolve(id, data);
      this._onMessage.dispatch(data);
    }
  }

  _handleError() {
    // console.log('error!!', event.target.url)
    if (this.isConnected) {
      // todo:
    }
  }

  _handleClose({code, reason}) {
    this._ws = null;
    const error = new Error(`Connection closed with reason: ${reason} (${code})`);
    if (this._pendings.has(OPENING_ID)) {
      this._pendings.reject(OPENING_ID, error);
    }
    if (this._pendings.has(CLOSING_ID)) {
      this._pendings.resolve(CLOSING_ID, {code, reason});
    }
    this._pendings.rejectAll(error);
  }
}

module.exports = WebSocketAsPromised;
