const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  image: { type: String, required: false },
  favourites: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Favourite" },
  ],
  recents: [{ type: mongoose.Types.ObjectId, required: true, ref: "Recent" }],
  books: [{ type: mongoose.Types.ObjectId, required: true, ref: "Book" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
