const mongoose = require("mongoose");
const mongooseValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  data: { type: Object, required: true },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

bookSchema.plugin(mongooseValidator);
module.exports = mongoose.model("Book", bookSchema);
