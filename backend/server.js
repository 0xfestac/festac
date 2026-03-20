require("dotenv").config();

const adminRoutes = require("./routes/admin");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");

const app = express();

// middleware
app.use("/admin", adminRoutes);
app.use(express.json());
app.use(cors());

// test route
app.get("/", (req, res) => {
  res.send("FESTAC IS ACTIVE 🔥");
});

// connect DB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ FESTAC_DB Connected"))
  .catch(err => console.log("❌ ERROR:", err.message));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// start server
app.listen(5000, () => {
  console.log("🚀 FESTAC is up and running on port 5000");
});

const path = require("path");

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Catch-all route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const cors = require("cors");
app.use(cors());