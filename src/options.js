/**
 * Default options.
 */

/**
 * @typedef {Object} Options
 * @property {Function} createWebSocket - custom WebSocket creation function
 * @property {Function} packRequest - custom packing request function, by default packs as JSON
 * @property {Function} unpackResponse - custom unpacking response function, by default unpacks as JSON
 * @property {Number} timeout=0 - timeout for opening connection and sending messages
 * @property {Number} connectionTimeout=0 - special timeout for opening connection, by default equals to `timeout`
 *
 * @defaults
 * please see [options.js](https://github.com/vitalets/websocket-as-promised/blob/master/src/options.js)
 * for default values and function parameters.
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
   * Unpacks raw data received by WebSocket.
   * Returned value should be object with {requestId, data} fields.
   *
   * @param {String|ArrayBuffer|Blob} rawData
   * @returns {Object<{requestId, data}>}
   */
  unpackResponse: rawData => {
    const data = JSON.parse(rawData);
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
