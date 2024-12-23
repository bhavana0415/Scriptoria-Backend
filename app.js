const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT;
const host = process.env.HOST;
const localhost = process.env.LOCALHOST;
const dbConnection = process.env.MONGO_URI;
const mongoose = require("mongoose");
const cors = require("cors");

const favouritesRoutes = require("./routes/favourites-routes");
const recentsRoutes = require("./routes/recents-routes");
const booksRoutes = require("./routes/books-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();
app.use(
  cors({
    origin: [host, localhost],
  })
);
// app.use(bodyParser.json());
app.use(express.json({ limit: "5000mb" }));
app.use(express.urlencoded({ limit: "5000mb", extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/favourites", favouritesRoutes);
app.use("/api/recents", recentsRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(dbConnection)
  .then(() => {
    app.listen(port);
  })
  .catch((err) => {
    console.log("error connecting to mongo");
  });

module.exports = app;
