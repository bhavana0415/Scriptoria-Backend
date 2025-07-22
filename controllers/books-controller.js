const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Book = require("../models/book");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

//used in frontend app
const getBooksByUserID = async (req, res, next) => {
  const userId = req.params.uid;

  let userBooks;
  try {
    userBooks = await User.findById(userId).populate("books").exec();
  } catch (err) {
    return next(new HttpError("Error occurred while fetching your books:", err));
  }

  if (!userBooks) {
    return next(new HttpError("Could not find your books.", 404));
  }

  res.json({
    books: userBooks.books,
  });
};

const createBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages.join("; "), 422));
  }

  const { data, user } = req.body;

  let existingUser;
  try {
    existingUser = await User.findById(user);
  } catch (error) {
    return next(new HttpError("Error occurred while saving your book:", error));
  }

  if (!existingUser) {
    return next(new HttpError("User not found.", 404));
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
    return next(new HttpError("Error occurred while saving your book:", error));
  }

  res.status(201).json({
    book: createdBook,
    message: "Saved your book successfully!",
  });
};

const updateBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new HttpError(errorMessages.join("; "), 422));
  }

  const bookId = req.params.pid;

  let book;
  try {
    book = await Book.findById(bookId);
  } catch (error) {
    return next(new HttpError("Error occurred while updating your book:", error));
  }

  if (!book) {
    return next(new HttpError("Could not find book.", 404));
  }

  if (book.user._id.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this book.", 401);
    return next(error);
  }

  const data = req.body;
  for (const key in data) {
    book[key] = data[key];
  }

  try {
    await book.save();
  } catch (error) {
    return next(new HttpError("Error occurred while updating your book:", error));
  }

  res.status(200).json({ book, message: "Updated your book successfully!" });
};

const deleteBook = async (req, res, next) => {
  const bookId = req.params.pid;

  let book;
  try {
    book = await Book.findById(bookId).populate("user");
  } catch (error) {
    return next(new HttpError("Error occurred while deleting your book:", error));
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
    book.user.books.pull(book);
    await book.user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Error occurred while deleting your book:", error));
  }

  res.status(200).json({ book, message: "Deleted your book successfully!" });
};

//not used in frontend app
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
    return next(new HttpError("Error while fetching Books", 402));
  }
  res.json({ books });
};

exports.getBookById = getBookById;
exports.createBook = createBook;
exports.updateBook = updateBook;
exports.deleteBook = deleteBook;
exports.getAllBooks = getAllBooks;
exports.getBooksByUserID = getBooksByUserID;
