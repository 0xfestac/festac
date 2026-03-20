const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// Balance
router.get("/balance", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ balance: user.balance });
});

// Send
router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount, pin } = req.body;
    const MAX_TRANSACTION = 1000; // max per transfer
const DAILY_LIMIT = 50000; // total per day

// check max per transaction
if (amount > MAX_TRANSACTION) {
  return res.status(400).send("Exceeds single transaction limit");
}

// check daily limit
const today = new Date();
today.setHours(0, 0, 0, 0);

const totalSentToday = sender.transactions
  .filter(t => t.type === "sent" && new Date(t.date) >= today)
  .reduce((sum, t) => sum + t.amount, 0);

if (totalSentToday + amount > DAILY_LIMIT) {
  return res.status(400).send("Daily transaction limit reached");
}

    // validate input
    if (!amount || amount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    if (!pin) {
      return res.status(400).send("PIN required");
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) {
      return res.status(404).send("Receiver not found");
    }

    // 🚨 PIN CHECK
    if (!sender.pin) {
      return res.status(400).send("Set PIN first");
    }

    const isMatch = await bcrypt.compare(pin, sender.pin);
    if (!isMatch) {
      return res.status(400).send("Incorrect PIN");
    }

    // prevent sending to self
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).send("Cannot send to yourself");
    }

    // check balance
    if (sender.balance < amount) {
      return res.status(400).send("Insufficient funds");
    }

    // transfer
    sender.balance -= amount;
    receiver.balance += amount;

    // save transaction
    sender.transactions.push({
      type: "sent",
      email: toEmail,
      amount
    });

    receiver.transactions.push({
      type: "received",
      email: sender.email,
      amount
    });

    await sender.save();
    await receiver.save();

    res.send("Transfer successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Transactions
router.get("/transactions", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.transactions);
});

module.exports = router;