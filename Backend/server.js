const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const upload = multer();
const Port = process.env.PORT || 1234;

// CORS configuration - handles preflight automatically
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://diwali-wishes-9pdl.onrender.com",
      "https://bulk-mail-rh3s.onrender.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "ngrok-skip-browser-warning"],
    credentials: true,
  })
);
app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files with correct MIME types
app.use(
  express.static("public", {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (filepath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Detect environment and configure SMTP accordingly
const isProduction =
  process.env.NODE_ENV === "production" || process.env.RENDER;
const SMTP_PORT = process.env.SMTP_PORT || (isProduction ? 587 : 465);
const SMTP_SECURE = SMTP_PORT === 465;

console.log(`🔧 SMTP Configuration:`);
console.log(
  `   Environment: ${
    isProduction ? "Production (Render)" : "Local Development"
  }`
);
console.log(`   Port: ${SMTP_PORT}`);
console.log(`   Secure: ${SMTP_SECURE}`);

const smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.rediffmailpro.com",
  port: parseInt(SMTP_PORT),
  secure: SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER || "info@atplgroup.com",
    pass: process.env.SMTP_PASS || "Archery@2025",
  },
  name: "atplgroup.com",
  logger: true,
  debug: isProduction ? false : true, // Debug only in development
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
};

const transporter = nodemailer.createTransport(smtpConfig);

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "ATPL Bulk Mail Server Running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Email service is running",
    smtp: "Rediffmail Pro",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint to send email with attachment
app.post("/api/send-email", upload.none(), async (req, res) => {
  console.log("📧 Received send-email request");
  console.log("Request body keys:", Object.keys(req.body));

  try {
    const { email, firstName, lastName, subject, message, imageBase64 } =
      req.body;

    // Validation
    if (!email || !firstName || !imageBase64) {
      console.log("⚠️ Missing required fields");
      return res.status(400).json({
        success: false,
        error: "Missing required fields (email, firstName, imageBase64)",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("⚠️ Invalid email format:", email);
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    const recipientName = lastName ? `${firstName} ${lastName}` : firstName;

    // Construct email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #39A3DD;">Dear ${recipientName},</h2>
        <p style="font-size: 16px; line-height: 1.6;">
         "As we celebrate the Festival of Lights, we extend our heartfelt gratitude for your continued trust and partnership. Your support and collaboration have been an integral part of our success.<br/><br/>May this Diwali bring joy, prosperity, and new opportunities to your business. Wishing you and your family a season filled with light, happiness, and togetherness."
        </p>
        
        <div style="margin: 20px 0;">
          <img src="cid:diwali_card" alt="Diwali Card" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        </div>
        <p style="font-size: 14px; color: #000; margin-top: 30px; font-weight:700">
         <strong> Best Regards,</strong><br>
          <strong style="color: #000080 ;font-size: 16px;">Archery Technocrats Pvt Limited 
</strong><br>
          <strong>
  <span style="color:#FF0000">|</span>Tidel Park
  <span style="color:#FF0000">|</span> Tambaram
  <span style="color:#FF0000">|</span> Madurai
  <span style="color:#FF0000">|</span> Bangalore
  <span style="color:#FF0000">|</span> Pune
  <span style="color:#FF0000">|</span> Hosur
  <span style="color:#FF0000">|</span>
</strong><br>
          <strong>Mobile:+91 73055 35993,73056 35993</strong>
        </p>
      </div>
    `;

    // Extract base64 data (handle both with and without data URI prefix)
    let base64Data = imageBase64;
    if (imageBase64.includes("base64,")) {
      base64Data = imageBase64.split("base64,")[1];
    }

    // Validate base64 data
    if (!base64Data || base64Data.length < 100) {
      console.log("⚠️ Invalid image data");
      return res.status(400).json({
        success: false,
        error: "Invalid image data provided",
      });
    }

    // Mail options
    const mailOptions = {
      from: '"Archery Technocrats Pvt. Ltd." <info@atplgroup.com>',
      to: email,
      subject: subject || "Happy Diwali!",
      html: htmlContent,
      attachments: [
        {
          filename: `diwali-card-${firstName}.png`,
          content: base64Data,
          encoding: "base64",
          cid: "diwali_card",
        },
      ],
    };

    // Send email with timeout
    console.log(`📨 Attempting to send email to ${email}...`);
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email timeout after 30s")), 30000)
      ),
    ]);

    console.log(
      `✅ Email sent successfully to ${email} (ID: ${info.messageId})`
    );

    // CRITICAL: Always return JSON response
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      recipient: email,
      name: recipientName,
    });
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    console.error("Full error:", error);

    // CRITICAL: Always return JSON response even on error
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send email",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  // CRITICAL: Always return JSON
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(Port, "0.0.0.0", () => {
  console.log(`🚀 Email server running on port ${Port}`);
  console.log(`📨 Ready to send emails via info@atplgroup.com`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
