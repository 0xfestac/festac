require("dotenv").config();
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("FESTAC IS ACTIVE 🔥");
});

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ ERROR:", err));

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});



