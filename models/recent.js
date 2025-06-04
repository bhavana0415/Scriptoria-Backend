const mongoose = require("mongoose");
const mongooseValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const recentSchema = new Schema({
  book_id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: false },
  authors: { type: String, required: true },
  image: { type: String, required: true },
  url: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

recentSchema.index({ book_id: 1, user: 1 }, { unique: true });

recentSchema.plugin(mongooseValidator);
module.exports = mongoose.model("Recent", recentSchema);
