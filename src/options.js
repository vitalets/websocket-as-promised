/**
 * Default options
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
  packMessage: (requestId, data) => {
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
  unpackMessage: message => {
    const data = JSON.parse(message);
    return {requestId: data.requestId, data};
  },

  /**
   * Timeout for connection and all requests
   */
  timeout: 0,
};
