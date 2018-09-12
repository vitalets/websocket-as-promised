
exports.throwIf = (condition, message) => {
  if (condition) {
    throw new Error(message);
  }
};
