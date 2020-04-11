const jwt = require("jsonwebtoken");
const secret = require("../config").SECRET;
const CustomError = require("../helpers/CustomError");

function getTokenFromHeader(req) {
  if (
    req.headers.authorization &&
    (req.headers.authorization.split(" ")[0] === "Token" ||
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

var auth = {
  required: async (req, res, next) => {
    try {
      const token = getTokenFromHeader(req);
      const data = jwt.verify(token, secret);
      req.payload = data;
      next();
    } catch (error) {
      next(new CustomError("Not authorized to access this resource", 401));
    }
  },
  optional: async (req, res, next) => {
    try {
      const token = getTokenFromHeader(req);
      const data = jwt.verify(token, secret);
      req.payload = data;
    } catch (error) {}

    next();
  },
};

module.exports = auth;
