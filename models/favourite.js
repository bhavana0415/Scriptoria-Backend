const mongoose = require("mongoose");
const mongooseValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const favouriteSchema = new Schema({
  book_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: false },
  authors: { type: String, required: true },
  image: { type: String, required: true },
  url: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

favouriteSchema.plugin(mongooseValidator); // mongoose-unique-validator -> to validate unique items in object (we use unique key word)
module.exports = mongoose.model("Favourite", favouriteSchema);
