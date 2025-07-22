const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Recent = require("../models/recent");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

//used in frontend app
const getRecentsByUserID = async (req, res, next) => {
  const userId = req.params.uid;

  let userRecents;
  try {
    userRecents = await User.findById(userId).populate("recents").exec();
  } catch (err) {
    return next(new HttpError("Error occurred while fetching recently viewed books:", err));
  }

  if (!userRecents) {
    return next(
      new HttpError("Could not find recent books for the user.", 404)
    );
  }

  const reversedRecents = userRecents.recents.reverse();

  res.json({
    recents: reversedRecents,
  });
};

const createRecent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages.join("; "), 422));
  }

  const { book_id, title, subtitle, authors, image, url, user } = req.body;

  let existingUser;
  try {
    existingUser = await User.findById(user);
  } catch (error) {
    return next(new HttpError("Error occurred while adding book to recents:", error));
  }

  if (!existingUser) {
    return next(new HttpError("User not found.", 404));
  }

  const createdRecent = new Recent({
    book_id,
    title,
    subtitle,
    authors,
    image,
    url,
    user: existingUser.id,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdRecent.save({ session: sess });
    existingUser.recents.push(createdRecent);
    await existingUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Error occurred while adding book to recents:", error));
  }

  res.status(201).json({
    book: createdRecent,
    message: "Added book to Recents successfully!",
  });
};

const deleteRecent = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Recent.findById(bookId).populate("user");
  } catch (error) {
    return next(new HttpError("Error occurred while removing book from recents:", error));
  }

  if (!book) {
    return next(new HttpError("Could not find book.", 404));
  }

  if (book.user.id.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to remove this book from recents.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await book.deleteOne({ session: sess });
    book.user.recents.pull(book);
    await book.user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Error occurred while removing book from recents:", error));
  }

  res.status(200).json({ book, message: "Removed book from recents successfully!" });
};

//not used in frontend app
const updateRecent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages.join("; "), 422));
  }

  const bookId = req.params.pid;

  let book;
  try {
    book = await Recent.findById(bookId);
    if (!book) {
      return next(
        new HttpError("Could not find book for the provided id.", 404)
      );
    }
  } catch (error) {
    return next(new HttpError("Error while fetching Recent", 500));
  }

  const data = req.body;

  for (const key in data) {
    book[key] = data[key];
  }

  try {
    await book.save();
  } catch (error) {
    console.error("Error while saving updated book:", error);
    return next(new HttpError("Unable to update book", 500));
  }

  res.status(200).json({ book, message: "Updated book successfully" });
};

const getRecentById = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Recent.findById(bookId);
  } catch (error) {
    return next(new HttpError("Error while fetching Recent", 500));
  }
  res.json({ book });
};

const getAllRecents = async (req, res, next) => {
  let books;
  try {
    books = await Recent.find();
  } catch (error) {
    return next(new HttpError("Error while fetching Favourites", 402));
  }
  res.json({ books });
};

exports.getRecentById = getRecentById;
exports.createRecent = createRecent;
exports.updateRecent = updateRecent;
exports.deleteRecent = deleteRecent;
exports.getAllRecents = getAllRecents;
exports.getRecentsByUserID = getRecentsByUserID;
