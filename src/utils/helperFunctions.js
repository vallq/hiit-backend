const removeId = ({ _id, ...rest }) => {
  return { ...rest };
};

const wrapAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => next(err));
};

module.exports = { removeId, wrapAsync };
