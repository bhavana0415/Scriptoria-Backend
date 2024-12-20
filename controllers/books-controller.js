const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Book = require("../models/book");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const getBookById = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Book.findById(bookId);
  } catch (error) {
    return next(new HttpError("Error while fetching Book", 500));
  }
  res.json({ book });
};

const getAllBooks = async (req, res, next) => {
  let books;
  try {
    books = await Book.find();
  } catch (error) {
    return next(new HttpError("Error while fetching Favourites", 402));
  }
  res.json({ books });
};

const getBooksByUserID = async (req, res, next) => {
  const userId = req.params.uid;

  let userBooks;
  try {
    userBooks = await User.findById(userId).populate("books").exec();
  } catch (err) {
    const error = new HttpError(
      "Fetching BOOKS failed, please try again later",
      500
    );
    return next(error);
  }

  if (!userBooks) {
    return next(
      new HttpError("Could not find books for the provided user id.", 404)
    );
  }

  res.json({
    books: userBooks.books,
  });
};

const createBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { data, user } = req.body;

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

  const createdBook = new Book({
    data,
    user: existingUser.id,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBook.save({ session: sess });
    existingUser.books.push(createdBook);
    await existingUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.error("Error while saving book:", error);
    return next(new HttpError("Unable to add book to Favourites", 500));
  }

  res.status(201).json({
    book: createdBook,
    message: "Added book to Favourites",
  });
};

const updateBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const bookId = req.params.pid;

  let book;
  try {
    book = await Book.findById(bookId);
    if (!book) {
      return next(
        new HttpError("Could not find book for the provided id.", 404)
      );
    }
  } catch (error) {
    return next(new HttpError("Error while fetching Book", 500));
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

const deleteBook = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Book.findById(bookId).populate("user"); //populate method allows us access a user document that we need to overwrite or change due to change in related document.
    //here when we delete book we also need to modify books array in user hence use populate. To use populate we need to connect 2 collections which we did using key word ref.
  } catch (error) {
    return next(new HttpError("Error while fetching Book", 500));
  }

  if (!book) {
    return next(new HttpError("Could not find book for the provided id.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await book.deleteOne({ session: sess });
    book.user.books.pull(book);
    await book.user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.error("Error while saving deleting book:", error);
    return next(new HttpError("Unable to delete book", 500));
  }

  res.status(200).json({ book, message: "Deleted book successfully" });
};

exports.getBookById = getBookById;
exports.createBook = createBook;
exports.updateBook = updateBook;
exports.deleteBook = deleteBook;
exports.getAllBooks = getAllBooks;
exports.getBooksByUserID = getBooksByUserID;
