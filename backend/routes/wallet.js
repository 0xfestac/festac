router.post("/send", auth, async (req, res) => {
  try {
    const { toEmail, amount, pin } = req.body;

    // Validation
    if (!toEmail || !amount || !pin) {
      return res.status(400).send("All fields required");
    }

    if (amount <= 0) {
      return res.status(400).send("Invalid amount");
    }

    // Per transaction limit
    if (amount > 50) {
      return res.status(400).send("Max transfer is $50");
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) return res.status(404).send("Receiver not found");

    if (sender.email === toEmail) {
      return res.status(400).send("Cannot send to yourself");
    }

    if (!sender.pin) return res.status(400).send("Set PIN first");

    // PIN check
    const validPin = await bcrypt.compare(pin, sender.pin);
    if (!validPin) return res.status(400).send("Invalid PIN");

    // ✅ DAILY LIMIT RESET
    const today = new Date().toDateString();
    const last = new Date(sender.lastReset).toDateString();

    if (today !== last) {
      sender.dailySent = 0;
      sender.lastReset = new Date();
    }

    // ✅ DAILY LIMIT CHECK
   const amt = Number(amt);

if (isNaN(amt)) {
  return res.status(400).send("Amount must be a number");
}
    }

    // Balance check
    if (sender.balance < amount) {
      return res.status(400).send("Insufficient balance");
    }

    // Transfer
    sender.balance -= amount;
    receiver.balance += amount;

    sender.dailySent += amount;

    // Save transactions
    sender.transactions.push({
      type: "debit",
      amount,
      to: toEmail
    });

    receiver.transactions.push({
      type: "credit",
      amount,
      from: sender.email
    });

    await sender.save();
    await receiver.save();

    res.send("Transfer successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Transfer failed");
  }
});