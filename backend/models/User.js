const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  pin: String,
  transactions: [
    {
      type: { type: String },
      email: String,
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: String, // "credit" or "debit"
  amount: Number,
  to: String,
  from: String,
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  pin: String,
  transactions: [transactionSchema]
});

module.exports = mongoose.model("User", userSchema);

module.exports = mongoose.model("User", userSchema);