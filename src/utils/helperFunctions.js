const removeId = ({ _id, ...rest }) => {
  return { ...rest };
};

module.exports = { removeId };
