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

// ========== NEW: Password verification endpoint ==========
// POST verify password before deletion
router.post("/:id/verify-password", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password is required",
      });
    }

    const account = await MailAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found",
      });
    }

    // Decrypt stored password and compare
    const decryptedPassword = account.decryptPassword();

    if (password === decryptedPassword) {
      res.json({ success: true, verified: true });
    } else {
      res.json({
        success: false,
        verified: false,
        error: "Incorrect password",
      });
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE mail account - NOW REQUIRES PASSWORD
router.delete("/:id", async (req, res) => {
  try {
    const { password } = req.body;

    // Require password for deletion
    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password is required to delete account",
      });
    }

    const account = await MailAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Mail account not found",
      });
    }

    // Decrypt stored password and verify
    const decryptedPassword = account.decryptPassword();

    if (password !== decryptedPassword) {
      return res.status(403).json({
        success: false,
        error: "Incorrect password. Account deletion cancelled.",
      });
    }

    // Password verified, proceed with deletion
    await MailAccount.findByIdAndDelete(req.params.id);

    console.log(`✅ Mail account deleted: ${account.email}`);

    res.json({
      success: true,
      message: "Mail account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mail account:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
