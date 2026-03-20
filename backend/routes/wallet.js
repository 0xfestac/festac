const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// Get balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Send money
router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount, pin } = req.body;

    // validate input
    if (!toEmail || !amount || !pin) {
      return res.status(400).send("All fields required");
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) {
      return res.status(404).send("Receiver not found");
    }

    // check PIN
    if (!sender.pin) {
      return res.status(400).send("Set PIN first");
    }

    const validPin = await bcrypt.compare(pin, sender.pin);
    if (!validPin) {
      return res.status(400).send("Invalid PIN");
    }

    // prevent self transfer
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

    // save transactions
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

// Get transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;