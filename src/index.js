/**
 * WebSocket with promise api
 */

/**
 * @external Channel
 */

const Channel = require('chnl');
const PromiseController = require('promise-controller');
const Requests = require('./requests');
const defaultOptions = require('./options');
const {throwIf} = require('./utils');

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
   * Please call `open()` method to connect.
   *
   * @param {String} url WebSocket URL
   * @param {Options} [options]
   */
  constructor(url, options) {
    this._assertOptions(options);
    this._url = url;
    this._options = Object.assign({}, defaultOptions, options);
    this._requests = new Requests();
    this._ws = null;
    this._wsSubscription = null;
    this._createOpeningController();
    this._createClosingController();
    this._createChannels();
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
   * Returns WebSocket url.
   *
   * @returns {String}
   */
  get url() {
    return this._url;
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
   * Event channel triggered when connection is opened.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onOpen.addListener(() => console.log('Connection opened'));
   *
   * @returns {Channel}
   */
  get onOpen() {
    return this._onOpen;
  }

  /**
   * Event channel triggered every time when message is sent to server.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onSend.addListener(data => console.log('Message sent', data));
   *
   * @returns {Channel}
   */
  get onSend() {
    return this._onSend;
  }

  /**
   * Event channel triggered every time when message received from server.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onMessage.addListener(message => console.log(message));
   *
   * @returns {Channel}
   */
  get onMessage() {
    return this._onMessage;
  }

  /**
   * Event channel triggered every time when received message is successfully unpacked.
   * For example, if you are using JSON transport, the listener will receive already JSON parsed data.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onUnpackedMessage.addListener(data => console.log(data.foo));
   *
   * @returns {Channel}
   */
  get onUnpackedMessage() {
    return this._onUnpackedMessage;
  }

  /**
   * Event channel triggered every time when response to some request comes.
   * Received message considered a response if requestId is found in it.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onResponse.addListener(data => console.log(data));
   *
   * @returns {Channel}
   */
  get onResponse() {
    return this._onResponse;
  }

  /**
   * Event channel triggered when connection closed.
   * Listener accepts single argument `{code, reason}`.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onClose.addListener(event => console.log(`Connections closed: ${event.reason}`));
   *
   * @returns {Channel}
   */
  get onClose() {
    return this._onClose;
  }

  /**
   * Event channel triggered when by Websocket 'error' event.
   *
   * @see https://vitalets.github.io/chnl/#channel
   * @example
   * wsp.onError.addListener(event => console.error(event));
   *
   * @returns {Channel}
   */
  get onError() {
    return this._onError;
  }

  /**
   * Opens WebSocket connection. If connection already opened, promise will be resolved with "open event".
   *
   * @returns {Promise<Event>}
   */
  open() {
    if (this.isClosing) {
      return Promise.reject(new Error(`Can't open WebSocket while closing.`));
    }
    if (this.isOpened) {
      return this._opening.promise;
    }
    return this._opening.call(() => {
      this._opening.promise.catch(e => this._cleanup(e));
      this._createWS();
    });
  }

  /**
   * Performs request and waits for response.
   *
   * @param {*} data
   * @param {Object} [options]
   * @param {String|Number} [options.requestId=<auto-generated>]
   * @param {Number} [options.timeout=0]
   * @returns {Promise}
   */
  sendRequest(data, options = {}) {
    const requestId = options.requestId || `${Math.random()}`;
    const timeout = options.timeout !== undefined ? options.timeout : this._options.timeout;
    return this._requests.create(requestId, () => {
      this._assertRequestIdHandlers();
      const finalData = this._options.attachRequestId(data, requestId);
      this.sendPacked(finalData);
    }, timeout);
  }

  /**
   * Packs data with `options.packMessage` and sends to the server.
   *
   * @param {*} data
   */
  sendPacked(data) {
    this._assertPackingHandlers();
    const message = this._options.packMessage(data);
    this.send(message);
  }

  /**
   * Sends data without packing.
   *
   * @param {String|Blob|ArrayBuffer} data
   */
  send(data) {
    throwIf(!this.isOpened, `Can't send data because WebSocket is not opened.`);
    this._ws.send(data);
    this._onSend.dispatchAsync(data);
  }

  /**
   * Closes WebSocket connection. If connection already closed, promise will be resolved with "close event".
   *
   * @param {number=} [code=1000] A numeric value indicating the status code.
   * @param {string=} [reason] A human-readable reason for closing connection.
   * @returns {Promise<Event>}
   */
  close(code, reason) { // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close
    return this.isClosed
      ? Promise.resolve(this._closing.value)
      : this._closing.call(() => this._ws.close(code, reason));
  }

  /**
   * Removes all listeners from WSP instance. Useful for cleanup.
   */
  removeAllListeners() {
    this._onOpen.removeAllListeners();
    this._onMessage.removeAllListeners();
    this._onUnpackedMessage.removeAllListeners();
    this._onResponse.removeAllListeners();
    this._onSend.removeAllListeners();
    this._onClose.removeAllListeners();
    this._onError.removeAllListeners();
  }

  _createOpeningController() {
    const connectionTimeout = this._options.connectionTimeout || this._options.timeout;
    this._opening = new PromiseController({
      timeout: connectionTimeout,
      timeoutReason: `Can't open WebSocket within allowed timeout: ${connectionTimeout} ms.`
    });
  }

  _createClosingController() {
    const closingTimeout = this._options.timeout;
    this._closing = new PromiseController({
      timeout: closingTimeout,
      timeoutReason: `Can't close WebSocket within allowed timeout: ${closingTimeout} ms.`
    });
  }

  _createChannels() {
    this._onOpen = new Channel();
    this._onMessage = new Channel();
    this._onUnpackedMessage = new Channel();
    this._onResponse = new Channel();
    this._onSend = new Channel();
    this._onClose = new Channel();
    this._onError = new Channel();
  }

  _createWS() {
    this._ws = this._options.createWebSocket(this._url);
    this._wsSubscription = new Channel.Subscription([
      { channel: this._ws, event: 'open', listener: e => this._handleOpen(e) },
      { channel: this._ws, event: 'message', listener: e => this._handleMessage(e) },
      { channel: this._ws, event: 'error', listener: e => this._handleError(e) },
      { channel: this._ws, event: 'close', listener: e => this._handleClose(e) },
    ]).on();
  }

  _handleOpen(event) {
    this._onOpen.dispatchAsync(event);
    this._opening.resolve(event);
  }

  _handleMessage(event) {
    const data = this._options.extractMessageData(event);
    this._onMessage.dispatchAsync(data);
    this._tryUnpack(data);
  }

  _tryUnpack(data) {
    if (this._options.unpackMessage) {
      data = this._options.unpackMessage(data);
      if (data !== undefined) {
        this._onUnpackedMessage.dispatchAsync(data);
        this._tryHandleResponse(data);
      }
    }
  }

  _tryHandleResponse(data) {
    if (this._options.extractRequestId) {
      const requestId = this._options.extractRequestId(data);
      if (requestId) {
        this._onResponse.dispatchAsync(data, requestId);
        this._requests.resolve(requestId, data);
      }
    }
  }

  _handleError(event) {
    this._onError.dispatchAsync(event);
  }

  _handleClose(event) {
    this._onClose.dispatchAsync(event);
    this._closing.resolve(event);
    const error = new Error(`WebSocket closed with reason: ${event.reason} (${event.code}).`);
    if (this._opening.isPending) {
      this._opening.reject(error);
    }
    this._cleanup(error);
  }

  _cleanupWS() {
    if (this._wsSubscription) {
      this._wsSubscription.off();
      this._wsSubscription = null;
    }
    this._ws = null;
  }

  _cleanup(error) {
    this._cleanupWS();
    this._requests.rejectAll(error);
  }

  _assertOptions(options) {
    Object.keys(options || {}).forEach(key => {
      if (!defaultOptions.hasOwnProperty(key)) {
        throw new Error(`Unknown option: ${key}`);
      }
    });
  }

  _assertPackingHandlers() {
    const { packMessage, unpackMessage } = this._options;
    throwIf(!packMessage || !unpackMessage,
      `Please define 'options.packMessage / options.unpackMessage' for sending packed messages.`
    );
  }

  _assertRequestIdHandlers() {
    const { attachRequestId, extractRequestId } = this._options;
    throwIf(!attachRequestId || !extractRequestId,
      `Please define 'options.attachRequestId / options.extractRequestId' for sending requests.`
    );
  }
}

module.exports = WebSocketAsPromised;
