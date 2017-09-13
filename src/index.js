/**
 * WebSocket with promise api
 */

/**
 * @external Channel
 */

const Channel = require('chnl');
const ControlledPromise = require('controlled-promise');
const utils = require('./utils');

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
   * Constructor. Unlike original WebSocket it does not immediately open connection.
   * Please call `open()` method manually to connect.
   *
   * @param {String} url WebSocket URL
   * @param {Object} [options]
   * @param {Function} [options.createWebSocket=url => new Websocket(url)] custom WebSocket creation method
   * @param {String} [options.idProp="id"] id property name attached to each message
   * @param {Number} [options.timeout=0] default timeout for requests
   */
  constructor(url, options) {
    this._url = url;
    this._options = Object.assign({}, DEFAULT_OPTIONS, utils.removeUndefined(options));
    this._opening = new ControlledPromise();
    this._closing = new ControlledPromise();
    // this._pendingRequests = new Pendings({timeout: this._options.timeout});
    this._pendingRequests = new Map();
    this._onMessage = new Channel();
    this._onClose = new Channel();
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
   * Is WebSocket connection in opening state.
   *
   * @returns {Boolean}
   */
  get isOpening() {
    return Boolean(this._ws && this._ws.readyState === STATE.CONNECTING);
  }

  /**
   * Is WebSocket connection opened.
   *
   * @returns {Boolean}
   */
  get isOpened() {
    return Boolean(this._ws && this._ws.readyState === STATE.OPEN);
  }

  /**
   * Is WebSocket connection in closing state.
   *
   * @returns {Boolean}
   */
  get isClosing() {
    return Boolean(this._ws && this._ws.readyState === STATE.CLOSING);
  }

  /**
   * Is WebSocket connection closed.
   *
   * @returns {Boolean}
   */
  get isClosed() {
    return Boolean(!this._ws || this._ws.readyState === STATE.CLOSED);
  }

  /**
   * Event channel triggered every time when message from server arrives.
   * Listener accepts two arguments:
   * 1. `jsonData` if JSON parse succeeded
   * 2. original `event.data`
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onMessage.addListener((data, jsonData) => console.log(data, jsonData));
   *
   * @returns {Channel}
   */
  get onMessage() {
    return this._onMessage;
  }

  /**
   * Event channel triggered when connection closed.
   * Listener accepts single argument `{code, reason}`.
   *
   * @see https://vitalets.github.io/chnl/#channel
   *
   * @returns {Channel}
   */
  get onClose() {
    return this._onClose;
  }

  /**
   * Opens WebSocket connection.
   *
   * @returns {Promise}
   */
  open() {
    if (this.isClosing) {
      return Promise.reject(new Error(`Can not open closing WebSocket`));
    }
    if (this.isOpened) {
      return this._opening.promise;
    }
    return this._opening.call(() => {
      const {timeout, createWebSocket} = this._options;
      this._opening.timeout(timeout, `Can't open connection within allowed timeout: ${timeout}ms`);
      this._ws = createWebSocket(this._url);
      this._addWsListeners();
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
      return Promise.reject(new Error(`WebSocket request data should be a plain object, got ${data}`));
    }
    const {idProp} = this._options;
    const fn = id => {
      data[idProp] = id;
      this.sendJson(data);
    };
    const id = data[idProp];
    const promise = id === undefined
      ? this._pendingRequests.add(fn, options)
      : this._pendingRequests.set(id, fn, options);
    return promise.catch(handleTimeoutError);
  }

  /**
   * Sends JSON data and does not wait for response.
   *
   * @param {Object} data
   */
  sendJson(data) {
    const dataStr = JSON.stringify(data);
    this.send(dataStr);
  }

  /**
   * Sends any WebSocket compatible data.
   *
   * @param {String|ArrayBuffer|Blob} data
   */
  send(data) {
    if (this.isOpened) {
      this._ws.send(data);
    } else {
      throw new Error('Can not send data because WebSocket is not opened.');
    }
  }

  /**
   * Closes WebSocket connection.
   *
   * @returns {Promise}
   */
  close() {
    if (this.isClosed) {
      return Promise.resolve();
    }
    return this._closing.call(() => {
      const {timeout} = this._options;
      this._closing.timeout(timeout, `Can't close connection within allowed timeout: ${timeout}ms`);
      this._ws.close();
    });
  }

  _addWsListeners() {
    this._ws.addEventListener('open', event => this._handleOpen(event));
    this._ws.addEventListener('message', event => this._handleMessage(event));
    this._ws.addEventListener('error', event => this._handleError(event));
    this._ws.addEventListener('close', event => this._handleClose(event));
  }

  _handleOpen(event) {
    this._opening.resolve(event);
  }

  _handleMessage({data}) {
    let jsonData;
    try {
      jsonData = JSON.parse(data);
      const id = jsonData && jsonData[this._options.idProp];
      this._pendingRequests.tryResolve(id, jsonData);
    } catch(e) {
      // do nothing if can not parse data
    }
    this._onMessage.dispatch(jsonData, data);
  }

  _handleError() {
    // todo: when this event comes?
  }

  _handleClose({reason, code}) {
    const error = new Error(`Connection closed with reason: ${reason} (${code})`);
    // todo: removeWsListeners
    this._ws = null;
    this._closing.resolve({reason, code});
    // this._pendingRequests.rejectAll(error);
    if (this._opening.isPending) {
      this._opening.reject(error);
    }
    this._onClose.dispatchAsync({reason, code});
  }
}

function handleTimeoutError(e) {
  // inheritance from built-in classes does not work after babel transpile :(
  // does not work: e instanceof Pendings.TimeoutError --> always false
  // see: https://stackoverflow.com/questions/42064466/instanceof-using-es6-class-inheritance-chain-doesnt-work
  const error = e && e.timeout !== undefined ? new Error(`Request rejected by timeout (${e.timeout} ms)`) : e;
  return Promise.reject(error);
}

module.exports = WebSocketAsPromised;
