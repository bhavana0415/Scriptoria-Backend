const express = require("express");
const recentsControllers = require("../controllers/recents-controller");
const router = express.Router();
const { check } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

router.use(checkAuth);

router.get("/:pid", recentsControllers.getRecentById);
router.get("/user/:uid", recentsControllers.getRecentsByUserID);
router.get("/", recentsControllers.getAllRecents);
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
  recentsControllers.createRecent
);
router.patch("/:pid", recentsControllers.updateRecent);
router.delete("/:pid", recentsControllers.deleteRecent);

module.exports = router;
