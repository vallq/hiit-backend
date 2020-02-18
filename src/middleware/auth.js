const jwt = require("jsonwebtoken");

const protectRoute = (req, res, next) => {
  try {
    if (!req.cookies.token) {
      throw new Error("You are not authorized to be here!");
    }
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    next();
  } catch (err) {
    err.statusCode = 401;
    err.message = "You are not authorized to be here!"
    next(err);
  }
};

module.exports = { protectRoute };
