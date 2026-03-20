const auth = require("../middleware/auth");
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ email, password: hashed });
  await user.save();

  res.json({ message: "User created with $0.99 bonus" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).send("Invalid password");

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token });
});

// Set transaction PIN
router.post("/set-pin", auth, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin || pin.length !== 4) {
      return res.status(400).send("PIN must be 4 digits");
    }

    const user = await User.findById(req.user.id);

    const hashedPin = await bcrypt.hash(pin, 10);
    user.pin = hashedPin;

    await user.save();

    res.send("PIN set successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
    const hashedPin = await bcrypt.hash(pin, 10);
user.pin = hashedPin;
await user.save();
});

module.exports = router;
