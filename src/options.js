/**
 * Default options.
 */

/**
 * @typedef {Object} Options
 * @property {Function} createWebSocket - custom WebSocket creation function
 * @property {Function} packRequest - custom packing request function
 * @property {Function} unpackResponse - custom unpacking response function
 * @property {Number} timeout=0 - timeout for opening connection and sending messages
 * @property {Number} connectionTimeout=0 - special timeout for opening connection (defaults to `timeout`)
 *
 * @defaults
 * please see [options.js](https://github.com/vitalets/websocket-as-promised/blob/master/src/options.js)
 * for default values
 */

module.exports = {
  /**
   * WebSocket creation function
   *
   * @param {String} url
   * @returns {WebSocket}
   */
  createWebSocket: url => new WebSocket(url),

  /**
   * Packs message to send by WebSocket.
   *
   * @param {String} requestId
   * @param {*} data
   * @returns {String|ArrayBuffer|Blob}
   */
  packRequest: (requestId, data) => {
    const message = Object.assign({requestId}, data);
    return JSON.stringify(message);
  },

  /**
   * Unpacks message received by WebSocket.
   * Returned value should be object with {requestId, data} fields.
   *
   * @param {String|ArrayBuffer|Blob} message
   * @returns {Object<{requestId, data}>}
   */
  unpackResponse: message => {
    const data = JSON.parse(message);
    return {requestId: data.requestId, data};
  },

  /**
   * Timeout for connection and all requests
   */
  timeout: 0,

  /**
   * Special timeout for opening connection
   */
  connectionTimeout: 0,
};
