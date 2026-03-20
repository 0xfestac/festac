const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get balance
router.get("/balance", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ balance: user.balance });
});

// Send money
router.post("/send", auth, async (req, res) => {
  const { toEmail, amount } = req.body;

  const sender = await User.findById(req.user.id);
  const receiver = await User.findOne({ email: toEmail });

  if (!receiver) return res.status(404).send("Receiver not found");
  if (sender.balance < amount) return res.status(400).send("Insufficient funds");

  sender.balance -= amount;
  receiver.balance += amount;

  await sender.save();
  await receiver.save();

  res.send("Transfer successful");
});

module.exports = router;

// Save transaction
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


