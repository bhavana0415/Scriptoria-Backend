const express = require("express");
const favouritesControllers = require("../controllers/favourites-controller");
const router = express.Router();
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

router.use(checkAuth);

router.get("/:pid", favouritesControllers.getFavouriteById);
router.get("/user/:uid", favouritesControllers.getFavouritesByUserID);
router.get("/", favouritesControllers.getAllFavourites);
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
  favouritesControllers.createFavourite
);
router.patch("/:pid", favouritesControllers.updateFavourite);
router.delete("/:pid", favouritesControllers.deleteFavourite);

module.exports = router;
