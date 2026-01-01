const mongoose = require("mongoose");
const crypto = require("crypto");

const mailAccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// FIXED: Ensure encryption key is EXACTLY 32 bytes (32 characters)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "b215cc0695cc2352fc49afa788e38267"; // Exactly 32 characters
const IV_LENGTH = 16;

// Validate key length on startup
if (Buffer.from(ENCRYPTION_KEY).length !== 32) {
  console.error("❌ ENCRYPTION_KEY must be exactly 32 bytes!");
  console.error(`Current length: ${Buffer.from(ENCRYPTION_KEY).length} bytes`);
  process.exit(1);
}

mailAccountSchema.methods.encryptPassword = function (password) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let encrypted = cipher.update(password);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("❌ Encryption error:", error.message);
    throw new Error("Password encryption failed");
  }
};

mailAccountSchema.methods.decryptPassword = function () {
  try {
    const textParts = this.password.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("❌ Decryption error:", error.message);
    throw new Error("Password decryption failed");
  }
};

module.exports = mongoose.model("MailAccount", mailAccountSchema);
