const router = require("express").Router();
const User = require("../models/User");

// Edit user balance
router.post("/edit-balance", async (req, res) => {
  const { email, newBalance } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send("User not found");

  user.balance = newBalance;
  await user.save();

  res.send("Balance updated");
});

module.exports = router;
