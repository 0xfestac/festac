const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

router.post("/send", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { toEmail, amount, pin } = req.body;

    // Validation
    if (!toEmail || !amount || !pin) {
      throw new Error("All fields required");
    }

    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      throw new Error("Invalid amount");
    }

    if (amt > 50) {
      throw new Error("Max transfer is $50");
    }

    // Get users WITH session
    const sender = await User.findById(req.user.id).session(session);
    const receiver = await User.findOne({ email: toEmail }).session(session);

    if (!sender) throw new Error("Sender not found");
    if (!receiver) throw new Error("Receiver not found");

    if (sender.email === toEmail) {
      throw new Error("Cannot send to yourself");
    }

    if (!sender.pin) {
      throw new Error("Set PIN first");
    }

    // PIN check
    const validPin = await bcrypt.compare(pin, sender.pin);
    if (!validPin) {
      throw new Error("Invalid PIN");
    }

    // DAILY RESET
    const today = new Date().toDateString();
    const last = sender.lastReset
      ? new Date(sender.lastReset).toDateString()
      : null;

    if (today !== last) {
      sender.dailySent = 0;
      sender.lastReset = new Date();
    }

    // DAILY LIMIT
    if ((sender.dailySent || 0) + amt > 2000) {
      throw new Error("Daily limit reached");
    }

    // BALANCE CHECK
    if (sender.balance < amt) {
      throw new Error("Insufficient balance");
    }

    // 💰 TRANSFER
    sender.balance -= amt;
    receiver.balance += amt;
    sender.dailySent = (sender.dailySent || 0) + amt;

    // TRANSACTIONS
    sender.transactions.push({
      type: "debit",
      amount: amt,
      to: toEmail
    });

    receiver.transactions.push({
      type: "credit",
      amount: amt,
      from: sender.email
    });

    // SAVE WITH SESSION (ATOMIC)
    await sender.save({ session });
    await receiver.save({ session });

    // ✅ COMMIT
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Transfer successful",
      balance: sender.balance
    });

  } catch (err) {
    // ❌ ROLLBACK
    await session.abortTransaction();
    session.endSession();

    res.status(400).send(err.message || "Transfer failed");
  }
});
module.exports = router;