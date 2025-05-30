const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const jwtSecret = process.env.AUTH_SECRET;

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, jwtSecret);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};
