const express = require("express");
require("dotenv").config();
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
    origin: process.env.HOST,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

app.use(express.json({ limit: "5000mb" }));
app.use(express.urlencoded({ limit: "5000mb", extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Scriptoria Backend</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 50px;
          }
          h1 {
            color: #333;
          }
          p {
            color: #555;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to the Scriptoria Backend</h1>
        <p>Your backend is running successfully!</p>
        <p>Use API endpoints like <code>/api/users/signup</code> to interact with the backend.</p>
      </body>
    </html>
  `);
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

// for local server
// mongoose
//   .connect(dbConnection)
//   .then(() => {
//     app.listen(5000, () => {
//       console.log(`Server is running on 5000 ${5000}`);
//     });
//   })
//   .catch((err) => {
//     console.log("Error connecting to MongoDB:", err);
//   });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

module.exports = app;
