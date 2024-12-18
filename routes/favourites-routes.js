const express = require("express");
const favouritesControllers = require("../controllers/favourites-controller");
const router = express.Router();
const { check } = require("express-validator");

router.get("/:pid", favouritesControllers.getBookById);
router.get("/books/:uid", favouritesControllers.getBookByUserID);
router.get("/", favouritesControllers.getAllBooks);
router.post(
  "/",
  [
    check("book_id").notEmpty().withMessage("book_id is required"),
    check("title").notEmpty().withMessage("title is required"),
    check("authors").notEmpty().withMessage("authors is required"),
    check("image").notEmpty().withMessage("image is required"),
    check("url").notEmpty().withMessage("url is required"),
    check("user").notEmpty().withMessage("user is required"),
  ],
  favouritesControllers.createBook
);
router.patch("/:pid", favouritesControllers.updateBook);
router.delete("/:pid", favouritesControllers.deleteBook);

module.exports = router;
