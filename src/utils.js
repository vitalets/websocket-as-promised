/**
 * Utils
 */

exports.removeUndefined = function (obj) {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : null);
  }
  return obj;
};
