/**
 * Default options.
 */

/**
 * @typedef {Object} Options
 * @property {Function} createWebSocket - function with `url` param, used for custom WebSocket creation.
 * By default uses global `WebSocket` constructor.
 *
 * @property {Function} [packMessage=null] - packs message for sending. For example `data => JSON.stringify(data)`.
 *
 * @property {Function} [unpackMessage=null] - unpacks received message. For example `message => JSON.parse(message)`.
 *
 * @property {Function} [injectRequestId=null] - injects request id into data.
 * For example `(data, requestId) => Object.assign({requestId}, data)`.
 *
 * @property {Function} [extractRequestId=null] - extracts request id from received data.
 * For example `data => data.requestId`.
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
   * @param {String|ArrayBuffer|Blob} message
   * @returns {*}
   */
  unpackMessage: null,

  /**
   * See {@link Options.injectRequestId}
   *
   * @param {*} data
   * @param {String|Number} requestId
   * @returns {*}
   */
  injectRequestId: null,

  /**
   * See {@link Options.extractRequestId}
   *
   * @param {*} data
   * @returns {String|Number|undefined}
   */
  extractRequestId: null,

  /**
   * See {@link Options.timeout}
   */
  timeout: 0,

  /**
   * See {@link Options.connectionTimeout}
   */
  connectionTimeout: 0,
};
