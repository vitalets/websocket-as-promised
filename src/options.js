/**
 * Default options.
 */

/**
 * @typedef {Object} Options
 * @property {Function} [createWebSocket=url => new WebSocket(url)] - custom function for WebSocket construction.
  *
 * @property {Function} [packMessage=noop] - packs message for sending. For example, `data => JSON.stringify(data)`.
 *
 * @property {Function} [unpackMessage=noop] - unpacks received message. For example, `data => JSON.parse(data)`.
 *
 * @property {Function} [attachRequestId=noop] - injects request id into data.
 * For example, `(data, requestId) => Object.assign({requestId}, data)`.
 *
 * @property {Function} [extractRequestId=noop] - extracts request id from received data.
 * For example, `data => data.requestId`.
 *
 * @property {Function} [extractMessageData=event => event.data] - extracts data from event object.
 *
 * @property {Number} timeout=0 - timeout for opening connection and sending messages.
 *
 * @property {Number} connectionTimeout=0 - special timeout for opening connection, by default equals to `timeout`.
 *
 * @defaults
 * please see [options.js](https://github.com/vitalets/websocket-as-promised/blob/master/src/options.js)
 */

module.exports = {
  /**
   * See {@link Options.createWebSocket}
   *
   * @param {String} url
   * @returns {WebSocket}
   */
  createWebSocket: url => new WebSocket(url),

  /**
   * See {@link Options.packMessage}
   *
   * @param {*} data
   * @returns {String|ArrayBuffer|Blob}
   */
  packMessage: null,

  /**
   * See {@link Options.unpackMessage}
   *
   * @param {String|ArrayBuffer|Blob} data
   * @returns {*}
   */
  unpackMessage: null,

  /**
   * See {@link Options.attachRequestId}
   *
   * @param {*} data
   * @param {String|Number} requestId
   * @returns {*}
   */
  attachRequestId: null,

  /**
   * See {@link Options.extractRequestId}
   *
   * @param {*} data
   * @returns {String|Number|undefined}
   */
  extractRequestId: null,

  /**
   * See {@link Options.extractMessageData}
   *
   * @param {*} event
   * @returns {*}
   */
  extractMessageData: event => event.data,

  /**
   * See {@link Options.timeout}
   */
  timeout: 0,

  /**
   * See {@link Options.connectionTimeout}
   */
  connectionTimeout: 0,
};
