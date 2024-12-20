const express = require("express");
const booksController = require("../controllers/books-controller");
const router = express.Router();
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

router.use(checkAuth);

router.get("/:pid", booksController.getBookById);
router.get("/user/:uid", booksController.getBooksByUserID);
router.get("/", booksController.getAllBooks);
router.post(
  "/",
  [check("user").notEmpty().withMessage("user is required")],
  booksController.createBook
);
router.patch("/:pid", booksController.updateBook);
router.delete("/:pid", booksController.deleteBook);

module.exports = router;
