
exports.throwIf = (condition, message) => {
  if (condition) {
    throw new Error(message);
  }
};

exports.isPromise = value => {
  return value && typeof value.then === 'function';
};
