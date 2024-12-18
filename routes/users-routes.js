const express = require("express");
const { check } = require("express-validator");
const usersController = require("../controllers/users-controller");
const router = express.Router();

router.get("/", usersController.getUsers);
router.post(
  "/signup",
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Invalid email format"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&]/)
      .withMessage(
        "Password must contain at least one special character (@, $, !, %, *, ?, &)"
      )
      .not()
      .matches(/\s/)
      .withMessage("Password must not contain whitespace"),
  ],
  usersController.signup
);
router.post(
  "/login",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Invalid email format"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  usersController.login
);

module.exports = router;
