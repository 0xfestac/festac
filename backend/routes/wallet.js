const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Send money
router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount } = req.body;

    // validation
    if (!amount || amount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) return res.status(404).send("Receiver not found");

    // prevent self transfer
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).send("Cannot send to yourself");
    }

    if (sender.balance < amount) {
      return res.status(400).send("Insufficient funds");
    }

    // update balances
    sender.balance -= amount;
    receiver.balance += amount;

    // ✅ SAVE TRANSACTIONS (correct place)
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
    res.status(500).send("Server error");
  }
});

// Get transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.transactions);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;