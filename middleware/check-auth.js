const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const jwtSecret = process.env.AUTH_SECRET;

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  let user;
  switch (req.method) {
    case "POST":
      user = req.body.user;
      break;
    case "GET":
      user = req.params.uid;
      break;
  }
  try {
    console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, jwtSecret);
    if (user !== decodedToken.userId) {
      throw new Error("Authentication failed! User mismatched");
    }
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Authentication failed!", 403);
    return next(error);
  }
};
