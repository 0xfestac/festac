const jwt = require("jsonwebtoken");
const SECRET = "festac_secret";

module.exports = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access denied");

  const verified = jwt.verify(token, SECRET);
  req.user = verified;
  next();
};
