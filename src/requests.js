/**
 * Class for manage pending requests.
 */

const ControlledPromise = require('controlled-promise');
const promiseFinally = require('promise.prototype.finally');

module.exports = class Requests {
  constructor() {
    this._items = new Map();
  }

  /**
   * Creates new request andd stores it in the list.
   *
   * @param {String} requestId
   * @param {Function} fn
   * @param {Number} timeout
   * @returns {Promise}
   */
  create(requestId, fn, timeout) {
    // todo: handle existing pending request with the same id
    // const existingRequest = this._items.get(requestId);
    // if (existingRequest && existingRequest.isPending) {
    //   existingRequest.reject(new Error(`WebSocket request is replaced, id: ${requestId}`));
    // }
    const request = new ControlledPromise();
    this._items.set(requestId, request);
    request.timeout(timeout, `WebSocket request was rejected by timeout (${timeout} ms). RequestId: ${requestId}`);
    return promiseFinally(request.call(fn), () => this._items.delete(requestId));
  }

  resolve(requestId, data) {
    if (requestId && this._items.has(requestId)) {
      this._items.get(requestId).resolve(data);
    }
  }

  rejectAll(error) {
    this._items.forEach(request => request.isPending ? request.reject(error) : null);
  }
};
