const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).send("User exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      balance: 0.99
    });

    await user.save();

    res.send("User created");

  } catch {
    res.status(500).send("Server error");
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email);
    if (!user) return res.status(400).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("Wrong password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token });

  } catch {
    res.status(500).send("Server error");
  }
});

// Set PIN
router.post("/set-pin", auth, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length !== 4) {
      return res.status(400).send("PIN must be 4 digits");
    }

    const user = await User.findById(req.user.id);

    user.pin = await bcrypt.hash(pin, 10);
    await user.save();

    res.send("PIN set");

  } catch {
    res.status(500).send("Server error");
  }
});

module.exports = router;