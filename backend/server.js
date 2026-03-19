const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URL = "mongodb+srv://festac:Fest1234@festac.hilikvj.mongodb.net/festac?retryWrites=true&w=majority";

console.log("CONNECTING TO:", MONGO_URL);

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌", err.message));

app.listen(5000, () => console.log("Server running on port 5000"));