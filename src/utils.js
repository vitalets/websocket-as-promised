/**
 * Utils
 * @private
 */

exports.mergeDefaults = function (options, defaultOptions) {
  return Object.assign({}, defaultOptions, exports.removeUndefined(options));
};

exports.removeUndefined = function (obj) {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : null);
  }
  return obj;
};

exports.generateId = function (prefix) {
  return `${prefix || ''}${Date.now()}-${Math.random()}`;
};
