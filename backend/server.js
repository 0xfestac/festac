require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health route
app.get("/", (req, res) => {
  res.send("🚀 FESTAC API LIVE");
});

// DB connect
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ DB ERROR:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

// 404
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});