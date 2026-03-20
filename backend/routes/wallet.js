const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
router.post("/send", auth, async (req, res) => {
  try {
    let { toEmail, amount, pin } = req.body;

    if (!toEmail || !amount || !pin) {
      return res.status(400).send("All fields required");
    }

    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).send("Invalid amount");
    }

    if (amt > 50) {
      return res.status(400).send("Max transfer is $50");
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) return res.status(404).send("Receiver not found");

    if (sender.email === toEmail) {
      return res.status(400).send("Cannot send to yourself");
    }

    if (!sender.pin) {
      return res.status(400).send("Set PIN first");
    }

    const validPin = await bcrypt.compare(pin, sender.pin);
    if (!validPin) {
      return res.status(400).send("Invalid PIN");
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

    if ((sender.dailySent || 0) + amt > 2000) {
      return res.status(400).send("Daily limit reached");
    }

    if (sender.balance < amt) {
      return res.status(400).send("Insufficient balance");
    }

    // Transfer
    sender.balance -= amt;
    receiver.balance += amt;
    sender.dailySent = (sender.dailySent || 0) + amt;

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

    await sender.save();
    await receiver.save();

    res.json({
      message: "Transfer successful",
      balance: sender.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Transfer failed");
  }
});

router.post("/fund", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).send("Invalid amount");
    }

    const user = await User.findById(req.user.id);

    user.balance += amt;

    user.transactions.push({
      type: "credit",
      amount: amt,
      from: "Funding"
    });

    await user.save();

    res.send("Wallet funded successfully");

  } catch (err) {
    res.status(500).send("Funding failed");
  }
});