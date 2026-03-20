const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json({ balance: user.balance });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// Send money
router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount } = req.body;
    const bcrypt = require("bcryptjs"); // add this at top

    // Validation
    if (!toEmail || !amount || amount <= 0) {
      return res.status(400).send("Invalid input");
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!sender) return res.status(404).send("Sender not found");
    if (!receiver) return res.status(404).send("Receiver not found");

    // Prevent sending to yourself
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).send("Cannot send to yourself");
    }

    // Check balance
    if (sender.balance < amount) {
      return res.status(400).send("Insufficient funds");
    }

    // Ensure transactions array exists
    if (!sender.transactions) sender.transactions = [];
    if (!receiver.transactions) receiver.transactions = [];

    // Update balances
    sender.balance -= amount;
    receiver.balance += amount;

    // Save transactions
    sender.transactions.push({
      type: "sent",
      email: receiver.email,
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

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json(user.transactions || []);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;