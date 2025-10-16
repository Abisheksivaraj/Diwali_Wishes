const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const upload = multer();
const Port = 1234;

// CORS configuration - allow your frontend domain
app.use(
  cors({
    origin: "https://atpl-bulk-mail-sender.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "50mb" }));

// Serve static files with correct MIME types
app.use(express.static("public"));
app.use(
  "/src",
  express.static("src", {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Configure SMTP for Rediffmail
const transporter = nodemailer.createTransport({
  host: "smtp.rediffmailpro.com",
  port: 465,
  secure: true,
  auth: {
    user: "info@atplgroup.com",
    pass: "Archery@2025",
  },
  name: "atplgroup.com",
  logger: true,
  debug: true,
});

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

// Endpoint to send email with attachment
app.post("/api/send-email", upload.none(), async (req, res) => {
  try {
    const { email, firstName, lastName, subject, message, imageBase64 } =
      req.body;

    if (!email || !firstName || !imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (email, firstName, imageBase64)",
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
          <strong style="color: #000080 ;font-size: 16px;">Archery Technocrats Pvt Limited</strong><br>
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

    // Mail options
    const mailOptions = {
      from: '"Archery Technocrats Pvt. Ltd." <info@atplgroup.com>',
      to: email,
      subject: subject || "Happy Diwali!",
      html: htmlContent,
      attachments: [
        {
          filename: `diwali-card-${firstName}.png`,
          content: imageBase64.split("base64,")[1],
          encoding: "base64",
          cid: "diwali_card",
        },
      ],
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email} (Message ID: ${info.messageId})`);

    res.json({
      success: true,
      messageId: info.messageId,
      recipient: email,
    });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send email",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Email service is running" });
});

// Serve index.html for all other routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || Port || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(
    `📨 Ready to send emails via info@atplgroup.com (SMTP Rediffmail)`
  );
});
