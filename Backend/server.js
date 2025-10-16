const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const upload = multer();
const Port = 1234;

app.use(
  cors({
    origin: "https://atpl-bulk-mail-sender.onrender.com", // <-- your frontend URL
  })
);
// Add this after your other middleware
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
app.use(express.json({ limit: "50mb" }));

// Configure SMTP for Rediffmail
const transporter = nodemailer.createTransport({
  host: "smtp.rediffmailpro.com",
  port: 465, // Use 587 if 465 doesn’t work
  secure: true, // true for SSL (465)
  auth: {
    user: "info@atplgroup.com", // your Rediffmail email
    pass: "Archery@2025", // your Rediffmail email password
  },
  name: "atplgroup.com",
  logger: true, // enable log messages
  debug: true,
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
</strong>

</strong><br>
          <strong>Mobile:+91 73055 35993,73056 35993</strong>
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
          content: imageBase64.split("base64,")[1], // remove data prefix if present
          encoding: "base64",
          cid: "diwali_card", // linked to <img src="cid:diwali_card">
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

// Start server
const PORT = Port || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Email server running on http://localhost:${PORT}`);
  console.log(
    `📨 Ready to send emails via info@atplgroup.com (SMTP Rediffmail)`
  );
});
