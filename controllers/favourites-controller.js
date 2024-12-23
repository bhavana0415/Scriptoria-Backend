const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Favourite = require("../models/favourite");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

//used in frontend app
const getFavouritesByUserID = async (req, res, next) => {
  const userId = req.params.uid;

  let userFavourites;
  try {
    userFavourites = await User.findById(userId).populate("favourites").exec();
  } catch (err) {
    return next(new HttpError(err));
  }

  if (!userFavourites) {
    return next(
      new HttpError("Could not find favourite book for the user.", 404)
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
    return next(new HttpError(error));
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
    return next(new HttpError(error));
  }

  res.status(201).json({
    book: createdFavourite,
    message: "Added book to Favourites successfully",
  });
};

const deleteFavourite = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Favourite.findById(bookId).populate("user");
  } catch (error) {
    return next(new HttpError(error));
  }

  if (!book) {
    return next(new HttpError("Could not find book.", 404));
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
    return next(new HttpError(error));
  }

  res.status(200).json({ book, message: "Deleted book successfully!!!" });
};

//not used in frontend app

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
      return next(new HttpError("Could not find book.", 404));
    }
  } catch (error) {
    return next(new HttpError(error));
  }

  const data = req.body;

  for (const key in data) {
    book[key] = data[key];
  }

  try {
    await book.save();
  } catch (error) {
    return next(new HttpError(error));
  }

  res.status(200).json({ book, message: "Updated book successfully!!!" });
};

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

exports.getFavouriteById = getFavouriteById;
exports.createFavourite = createFavourite;
exports.updateFavourite = updateFavourite;
exports.deleteFavourite = deleteFavourite;
exports.getAllFavourites = getAllFavourites;
exports.getFavouritesByUserID = getFavouritesByUserID;
