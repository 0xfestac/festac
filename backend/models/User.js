const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: String,
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

  // ✅ Daily limit tracking
  dailySent: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },

  transactions: [transactionSchema]
});

role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
}

module.exports = mongoose.model("User", userSchema);