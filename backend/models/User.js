const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 0.99 }, // welcome bonus
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);

transactions: [
  {
    type: { type: String }, // "sent" or "received"
    email: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }
]

pin: {
  type: String
}

