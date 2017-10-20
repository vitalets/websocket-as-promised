/**
 * Default options.
 */

/**
 * @typedef {Object} Options
 * @property {Function} createWebSocket - function with `url` param, used for custom WebSocket creation.
 * By default uses global `WebSocket` constructor.
 *
 * @property {Function} packMessage - function with `(data, requestId)` params.
 * Packs message for sending. If `requestId` param exists - data is send from
 * `.request()` method and you should pack `requestId` into message.
 * By default puts request id into `requestId` field and packs with `JSON.stringify()`.
 *
 * @property {Function} unpackMessage - function with `message` param. Tries to unpack message received by WebSocket.
 * If returned value is object
 * like `{requestId, data}` - message considered to be response on request with corresponding `requestId`.
 * By default unpacks with `JSON.parse()` and looks for request id in `requestId` field.
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
   * See [@link Options.createWebSocket]
   *
   * @param {String} url
   * @returns {WebSocket}
   */
  createWebSocket: url => new WebSocket(url),

  /**
   * See [@link Options.packMessage]
   *
   * @param {*} data
   * @param {String} [requestId]
   * @returns {String|ArrayBuffer|Blob}
   */
  packMessage: (data, requestId) => {
    if (requestId) {
      data.requestId = requestId;
    }
    return JSON.stringify(data);
  },

  /**
   * See [@link Options.unpackMessage]
   *
   * @param {String|ArrayBuffer|Blob} message
   * @returns {Object<{requestId, data}>|*}
   */
  unpackMessage: message => {
    const data = JSON.parse(message);
    return data.requestId ? {requestId: data.requestId, data} : data;
  },

  /**
   * See typedef.
   */
  timeout: 0,

  /**
   * See [@link Options.timeout]
   */
  connectionTimeout: 0,
};
