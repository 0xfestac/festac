const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");


// ✅ Get balance
router.get("/balance", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ balance: user.balance });
});


// ✅ Fund wallet
router.post("/fund", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    const user = await User.findById(req.user.id);

    user.balance += amount;

    user.transactions.push({
      type: "fund",
      email: user.email,
      amount
    });

    await user.save();

    res.send("Wallet funded");

  } catch (err) {
    res.status(500).send("Server error");
  }
});


// ✅ Send money (PIN + limits)
router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount, pin } = req.body;

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

    // ✅ PIN check
    if (!sender.pin) {
      return res.status(400).send("Set PIN first");
    }

    const isMatch = await bcrypt.compare(pin, sender.pin);
    if (!isMatch) {
      return res.status(400).send("Incorrect PIN");
    }

    // ❌ prevent self transfer
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).send("Cannot send to yourself");
    }

    // ✅ limits
    const MAX_TRANSACTION = 100000;
    const DAILY_LIMIT = 500000;

    if (amount > MAX_TRANSACTION) {
      return res.status(400).send("Exceeds single limit");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSentToday = sender.transactions
      .filter(t => t.type === "sent" && new Date(t.date) >= today)
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalSentToday + amount > DAILY_LIMIT) {
      return res.status(400).send("Daily limit reached");
    }

    // 💸 transfer
    if (sender.balance < amount) {
      return res.status(400).send("Insufficient funds");
    }

    sender.balance -= amount;
    receiver.balance += amount;

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


// ✅ Get transactions
router.get("/transactions", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.transactions);
});


module.exports = router;