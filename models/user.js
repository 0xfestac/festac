const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 0.99 }, // welcome bonus
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
