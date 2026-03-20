const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

console.log("✅ Wallet routes loaded");

// ✅ Get balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Send money
router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount, pin } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) return res.status(404).send("Receiver not found");

    // PIN check
    if (!sender.pin) return res.status(400).send("Set PIN first");

    const valid = await bcrypt.compare(pin, sender.pin);
    if (!valid) return res.status(400).send("Incorrect PIN");

    // prevent self transfer
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).send("Cannot send to yourself");
    }

    if (sender.balance < amount) {
      return res.status(400).send("Insufficient funds");
    }

    // transfer
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

// ✅ Transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Test route
router.get("/test", (req, res) => {
  res.send("Wallet route working");
});

module.exports = router;