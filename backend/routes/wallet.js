const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

// ✅ Check balance
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
      type: "credit",
      amount,
      from: "self"
    });

    await user.save();

    res.send("Wallet funded");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error funding wallet");
  }
});

// ✅ Send money
router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount, pin } = req.body;

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) return res.status(404).send("Receiver not found");

    // PIN check
    if (!sender.pin) return res.status(400).send("Set PIN first");

    const validPin = await bcrypt.compare(pin, sender.pin);
    if (!validPin) return res.status(400).send("Invalid PIN");

    // Balance check
    if (sender.balance < amount) {
      return res.status(400).send("Insufficient balance");
    }

    // Transfer
    sender.balance -= amount;
    receiver.balance += amount;

    // Save transactions
    sender.transactions.push({
      type: "debit",
      amount,
      to: toEmail
    });

    receiver.transactions.push({
      type: "credit",
      amount,
      from: sender.email
    });

    await sender.save();
    await receiver.save();

    res.send("Transfer successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Transfer error");
  }
});

// ✅ Transaction history
router.get("/transactions", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.transactions);
});

module.exports = router;