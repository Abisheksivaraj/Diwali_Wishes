const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔄 SERVER STARTING");

const app = express();
const upload = multer();
const Port = process.env.PORT || 1234;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5177",
      "https://atpl-mail-sender.onrender.com",
      "https://bulk-mail-rh3s.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
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

// ===================== MongoDB Connection - FIXED =====================
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Abishek:Abi2288@cluster0.ddlzsna.mongodb.net/Atpl_Mail";

console.log("🔌 Connecting to MongoDB...");

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
});

const db = mongoose.connection;

// Connection event handlers
db.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

db.on("disconnected", () => {
  console.error("⚠️  MongoDB DISCONNECTED!");
});

db.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

db.once("open", () => {
  console.log("✅ MongoDB Connected Successfully!");
  console.log(`📊 Database: ${db.name}`);
  console.log(`🌐 Host: ${db.host}`);
  console.log(`🔌 Ready State: ${db.readyState}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  db.close(() => {
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  });
});
// ===================== End MongoDB Connection =====================

// Import routes AFTER MongoDB setup
const templateRoutes = require("./src/Routes/templates");
const signatureRoutes = require("./src/Routes/signatures");
const mailAccountRoutes = require("./src/Routes/mailAccounts");

app.use("/templates", templateRoutes);
app.use("/signatures", signatureRoutes);
app.use("/mail-accounts", mailAccountRoutes);

// Detect environment and configure SMTP
const isProduction =
  process.env.NODE_ENV === "production" || process.env.RENDER;
const SMTP_PORT = process.env.SMTP_PORT || (isProduction ? 587 : 465);
const SMTP_SECURE = SMTP_PORT == 465;

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
    user: process.env.SMTP_USER || "kumutha.k@atplgroup.com",
    pass: process.env.SMTP_PASS || "Love@7485",
  },
  name: "atplgroup.com",
  logger: true,
  debug: isProduction ? false : true,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
};

const transporter = nodemailer.createTransport(smtpConfig);

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

// Function to replace template variables - FIXED to preserve formatting
function replaceTemplateVariables(template, firstName, lastName, email) {
  if (!template) return "";

  let result = template;

  // Replace ${firstName} format (old format)
  result = result.replace(/\$\{firstName\}/g, firstName || "");
  result = result.replace(/\$\{lastName\}/g, lastName || "");
  result = result.replace(/\$\{email\}/g, email || "");

  // Replace {{firstName}} format (NEW - used by frontend Rich Text Editor)
  result = result.replace(/\{\{firstName\}\}/g, firstName || "");
  result = result.replace(/\{\{lastName\}\}/g, lastName || "");
  result = result.replace(/\{\{email\}\}/g, email || "");

  // Replace fullName in both formats
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  result = result.replace(/\$\{fullName\}/g, fullName || "");
  result = result.replace(/\{\{fullName\}\}/g, fullName || "");

  return result;
}

// Function to generate email HTML - FIXED to preserve all formatting
function generateEmailHTML(
  firstName,
  lastName,
  email,
  subject,
  body,
  signature = "",
  images = []
) {
  // Process body and signature with variable replacement
  const processedBody = replaceTemplateVariables(
    body,
    firstName,
    lastName,
    email
  );
  const processedSignature = replaceTemplateVariables(
    signature,
    firstName,
    lastName,
    email
  );

  // Keep the HTML as-is from the rich text editor
  const formattedMessage = processedBody;
  const formattedSignature = processedSignature || "";

  let imagesHTML = "";
  if (images && Array.isArray(images) && images.length > 0) {
    images.forEach((img, index) => {
      const cid = `email_image_${index}`;
      imagesHTML += `
        <tr>
          <td align="center" style="padding: 20px 0;">
            <img src="cid:${cid}" alt="${img.filename}" width="${img.width}" style="max-width: ${img.width}px; width: 100%; height: auto; border-radius: 8px; display: block;">
          </td>
        </tr>`;
    });
  }

  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin: 0; padding: 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; margin: 0; padding: 0;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">
              <tr>
                <td style="padding: 30px 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #000000; font-family: Arial, sans-serif;">
                        ${formattedMessage}
                      </td>
                    </tr>
                  </table>
                  ${imagesHTML}
                  ${
                    formattedSignature
                      ? `
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px;">
                    <tr>
                      <td style="font-size: 14px; line-height: 1.6; color: #000000; font-family: Arial, sans-serif;">
                        ${formattedSignature}
                      </td>
                    </tr>
                  </table>
                  `
                      : `
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px;">
                    <tr>
                      <td style="text-align: left;">
                        <p style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 14px; color: #000000; font-weight: 700;">Thanks & Regards,</p>
                        <p style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 14px; color: #000000; font-weight: 700;">Kumutha K</p>
                        <p style="margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 16px; color: #000080; font-weight: 700;">Archery Technocrats Pvt Limited</p>
                      </td>
                    </tr>
                  </table>
                  `
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Health check
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
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Send email endpoint
app.post("/api/send-email", upload.none(), async (req, res) => {
  console.log("📧 Received send-email request");

  try {
    const {
      email,
      firstName,
      lastName,
      subject,
      body,
      signature,
      attachments,
      images,
      senderEmail,
      senderPassword,
      senderName,
    } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (email, firstName)",
      });
    }

    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing template data (subject, body)",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    const recipientName = lastName ? `${firstName} ${lastName}` : firstName;

    let emailTransporter = transporter;

    if (senderEmail && senderPassword) {
      console.log(`📧 Using custom sender: ${senderEmail}`);

      emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.rediffmailpro.com",
        port: parseInt(SMTP_PORT),
        secure: SMTP_SECURE,
        auth: {
          user: senderEmail,
          pass: senderPassword,
        },
        name: "atplgroup.com",
        logger: true,
        debug: isProduction ? false : true,
        tls: {
          rejectUnauthorized: false,
          minVersion: "TLSv1.2",
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
      });
    }

    const processedSubject = replaceTemplateVariables(
      subject,
      firstName,
      lastName,
      email
    );

    const htmlContent = generateEmailHTML(
      firstName,
      lastName,
      email,
      processedSubject,
      body,
      signature,
      images
    );

    const fromAddress = senderEmail
      ? `"${senderName || "Email Sender"}" <${senderEmail}>`
      : '"Archery Technocrats Pvt. Ltd." <info@atplgroup.com>';

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: processedSubject,
      html: htmlContent,
      attachments: [],
    };

    if (images && Array.isArray(images) && images.length > 0) {
      images.forEach((image, index) => {
        if (image.content) {
          let base64Data = image.content;
          if (image.content.includes("base64,")) {
            base64Data = image.content.split("base64,")[1];
          }

          mailOptions.attachments.push({
            filename: image.filename || `image_${index}.png`,
            content: base64Data,
            encoding: "base64",
            cid: `email_image_${index}`,
          });
        }
      });
    }

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.filename && attachment.content) {
          let base64Data = attachment.content;
          if (attachment.content.includes("base64,")) {
            base64Data = attachment.content.split("base64,")[1];
          }

          mailOptions.attachments.push({
            filename: attachment.filename,
            content: base64Data,
            encoding: "base64",
            contentType: attachment.contentType || "application/octet-stream",
          });
        }
      }
    }

    console.log(`📨 Sending to ${email} from ${fromAddress}`);
    console.log(`📋 Subject: ${processedSubject}`);

    const info = await Promise.race([
      emailTransporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email timeout after 30s")), 30000)
      ),
    ]);

    console.log(`✅ Email sent successfully (ID: ${info.messageId})`);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      recipient: email,
      name: recipientName,
      sender: fromAddress,
      attachmentsCount: mailOptions.attachments.length,
    });
  } catch (error) {
    console.error("❌ Email send error:", error.message);

    let errorReason = "Delivery Failed";
    if (error.message.includes("timeout")) {
      errorReason = "SMTP Timeout";
    } else if (error.message.includes("550")) {
      errorReason = "Mailbox Not Found";
    } else if (error.message.includes("553")) {
      errorReason = "Invalid Recipient";
    } else if (error.message.includes("Invalid")) {
      errorReason = "Invalid Email Format";
    } else if (
      error.message.includes("authentication") ||
      error.message.includes("credentials")
    ) {
      errorReason = "Invalid Email Credentials";
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send email",
      reason: errorReason,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// ===================== Start Server - FIXED =====================
// Wait for MongoDB before starting HTTP server
db.once("open", () => {
  // Give MongoDB a moment to fully stabilize
  setTimeout(() => {
    app.listen(Port, "0.0.0.0", () => {
      console.log("\n" + "=".repeat(60));
      console.log(`🚀 Server running on http://localhost:${Port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 MongoDB: ${db.name} (State: ${db.readyState})`);
      console.log("=".repeat(60) + "\n");
    });
  }, 2000);
});
