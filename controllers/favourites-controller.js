const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Favourite = require("../models/favourite");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const getFavouriteById = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Favourite.findById(bookId);
  } catch (error) {
    return next(new HttpError("Error while fetching Favourite", 500));
  }
  res.json({ book });
};

const getAllFavourites = async (req, res, next) => {
  let books;
  try {
    books = await Favourite.find();
  } catch (error) {
    return next(new HttpError("Error while fetching Favourites", 402));
  }
  res.json({ books });
};

const getFavouritesByUserID = async (req, res, next) => {
  const userId = req.params.uid;

  let userFavourites;
  try {
    userFavourites = await User.findById(userId).populate("favourites").exec();
  } catch (err) {
    const error = new HttpError(
      "Fetching favourites failed, please try again later",
      500
    );
    return next(error);
  }

  if (!userFavourites) {
    return next(
      new HttpError("Could not find books for the provided user id.", 404)
    );
  }

  res.json({
    favourites: userFavourites.favourites,
  });
};

const createFavourite = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages.join(", "), 422));
  }

  const { book_id, title, subtitle, authors, image, url, user } = req.body;

  let existingUser;
  try {
    existingUser = await User.findById(user);
    console.log("Fetched User:", existingUser);
    if (!existingUser) {
      return next(new HttpError("User not found", 404));
    }
  } catch (error) {
    console.error("Error while fetching user:", error);
    return next(new HttpError("Error while fetching user", 500));
  }

  const createdFavourite = new Favourite({
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
    await createdFavourite.save({ session: sess });
    existingUser.favourites.push(createdFavourite);
    await existingUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.error("Error while saving book:", error);
    return next(new HttpError("Unable to add book to Favourites", 500));
  }

  res.status(201).json({
    book: createdFavourite,
    message: "Added book to Favourites",
  });
};

const updateFavourite = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages.join(", "), 422));
  }

  const bookId = req.params.pid;

  let book;
  try {
    book = await Favourite.findById(bookId);
    if (!book) {
      return next(
        new HttpError("Could not find book for the provided id.", 404)
      );
    }
  } catch (error) {
    return next(new HttpError("Error while fetching Favourite", 500));
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

const deleteFavourite = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Favourite.findById(bookId).populate("user"); //populate method allows us access a user document that we need to overwrite or change due to change in related document.
    //here when we delete book we also need to modify books array in user hence use populate. To use populate we need to connect 2 collections which we did using key word ref.
  } catch (error) {
    return next(new HttpError("Error while fetching Favourite", 500));
  }

  if (!book) {
    return next(new HttpError("Could not find book for the provided id.", 404));
  }

  if (book.user.id.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this book.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await book.deleteOne({ session: sess });
    book.user.favourites.pull(book);
    await book.user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.error("Error while saving deleting book:", error);
    return next(new HttpError("Unable to delete book", 500));
  }

  res.status(200).json({ book, message: "Deleted book successfully" });
};

exports.getFavouriteById = getFavouriteById;
exports.createFavourite = createFavourite;
exports.updateFavourite = updateFavourite;
exports.deleteFavourite = deleteFavourite;
exports.getAllFavourites = getAllFavourites;
exports.getFavouritesByUserID = getFavouritesByUserID;
