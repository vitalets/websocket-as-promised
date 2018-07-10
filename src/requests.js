/**
 * Class for manage pending requests.
 * @private
 */

const PromiseController = require('promise-controller');
const promiseFinally = require('promise.prototype.finally');

module.exports = class Requests {
  constructor() {
    this._items = new Map();
  }

  /**
   * Creates new request and stores it in the list.
   *
   * @param {String|Number} requestId
   * @param {Function} fn
   * @param {Number} timeout
   * @returns {Promise}
   */
  create(requestId, fn, timeout) {
    this._rejectExistingRequest(requestId);
    return this._createNewRequest(requestId, fn, timeout);
  }

  resolve(requestId, data) {
    if (requestId && this._items.has(requestId)) {
      this._items.get(requestId).resolve(data);
    }
  }

  rejectAll(error) {
    this._items.forEach(request => request.isPending ? request.reject(error) : null);
  }

  _rejectExistingRequest(requestId) {
    const existingRequest = this._items.get(requestId);
    if (existingRequest && existingRequest.isPending) {
      existingRequest.reject(new Error(`WebSocket request is replaced, id: ${requestId}`));
    }
  }

  _createNewRequest(requestId, fn, timeout) {
    const request = new PromiseController({
      timeout,
      timeoutReason: `WebSocket request was rejected by timeout (${timeout} ms). RequestId: ${requestId}`
    });
    this._items.set(requestId, request);
    return promiseFinally(request.call(fn), () => this._deleteRequest(requestId, request));
  }

  _deleteRequest(requestId, request) {
    // this check is important when request was replaced
    if (this._items.get(requestId) === request) {
      this._items.delete(requestId);
    }
  }
};
