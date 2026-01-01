const express = require("express");
const router = express.Router();
const MailAccount = require("../Models/MailAccount");

// GET all mail accounts (without passwords)
router.get("/", async (req, res) => {
  try {
    const accounts = await MailAccount.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ accounts });
  } catch (error) {
    console.error("Error fetching mail accounts:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET single mail account by ID (with decrypted password)
router.get("/:id", async (req, res) => {
  try {
    const account = await MailAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Mail account not found" });
    }

    // Decrypt password
    const decryptedPassword = account.decryptPassword();

    res.json({
      account: {
        id: account._id,
        username: account.username,
        email: account.email,
        password: decryptedPassword,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching mail account:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new mail account
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: username, email, password",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email already exists
    const existingAccount = await MailAccount.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newAccount = new MailAccount({
      username,
      email,
      password: "", // Temporary, will be encrypted
    });

    // Encrypt password
    newAccount.password = newAccount.encryptPassword(password);

    await newAccount.save();

    console.log(`✅ Mail account created: ${email}`);

    // Return without password
    res.status(201).json({
      account: {
        id: newAccount._id,
        username: newAccount.username,
        email: newAccount.email,
        createdAt: newAccount.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating mail account:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update mail account
router.put("/:id", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const account = await MailAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Mail account not found" });
    }

    if (username) account.username = username;
    if (email) account.email = email;
    if (password) account.password = account.encryptPassword(password);

    await account.save();

    console.log(`✅ Mail account updated: ${account.email}`);

    res.json({
      account: {
        id: account._id,
        username: account.username,
        email: account.email,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating mail account:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE mail account
router.delete("/:id", async (req, res) => {
  try {
    const deletedAccount = await MailAccount.findByIdAndDelete(req.params.id);

    if (!deletedAccount) {
      return res.status(404).json({ error: "Mail account not found" });
    }

    console.log(`✅ Mail account deleted: ${deletedAccount.email}`);
    res.json({
      success: true,
      message: "Mail account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mail account:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
