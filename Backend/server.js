const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const upload = multer();
const Port = process.env.PORT || 1234;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://atpl-bulk-mail-sender.onrender.com",
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

// MongoDB Connection - FIXED: Added database name to connection string
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://techfilesatpl:Bsm2XmWLzg1uz7Xu@archery-technocrats-clo.mnjvynw.mongodb.net/bulkmail?retryWrites=true&w=majority&appName=Archery-Technocrats-CloudPrinting",
    {
      serverSelectionTimeoutMS: 30000, // 30 seconds for server selection
      socketTimeoutMS: 45000, // 45 seconds for socket operations
      connectTimeoutMS: 30000, // 30 seconds for initial connection
    }
  )
  .then(() => console.log("✅ MongoDB Connected to database: bulkmail"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Import Routes
const templateRoutes = require("./src/Routes/templates");
const signatureRoutes = require("./src/Routes/signatures");
const mailAccountRoutes = require("./src/Routes/mailAccounts");

// Use Routes - FIXED: Added app.use for templates
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

// Function to replace template variables
function replaceTemplateVariables(template, firstName, lastName) {
  if (!template) return "";

  let result = template;

  // Replace ${firstName} with actual first name
  result = result.replace(/\$\{firstName\}/g, firstName || "");

  // Replace ${lastName} with actual last name
  result = result.replace(/\$\{lastName\}/g, lastName || "");

  // Replace ${fullName} with full name
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  result = result.replace(/\$\{fullName\}/g, fullName || "");

  return result;
}

// Function to generate email HTML
function generateEmailHTML(
  firstName,
  lastName,
  subject,
  body,
  signature = "",
  images = []
) {
  // Replace template variables in body and signature
  const processedBody = replaceTemplateVariables(body, firstName, lastName);
  const processedSignature = replaceTemplateVariables(
    signature,
    firstName,
    lastName
  );

  // Format message with line breaks
  const formattedMessage = processedBody.split("\n").join("<br>");
  const formattedSignature = processedSignature
    ? processedSignature.split("\n").join("<br>")
    : "";

  // Build images HTML
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
      
      <!--[if mso]>
      <style type="text/css">
        table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; margin: 0; padding: 0;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">
              <tr>
                <td style="padding: 30px 40px;">
                  <!-- Greeting -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                     
                    </tr>
                  </table>
                  
                  <!-- Message Body -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #000000; font-family: Arial, sans-serif;">
                        ${formattedMessage}
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Images -->
                  ${imagesHTML}
                  
                  <!-- Signature -->
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
                        <p style="margin: 0 0 8px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; font-weight: 700; text-align: left;">Thanks & Regards,</p>
                        <p style="margin: 0 0 8px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; font-weight: 700; text-align: left;">Kumutha K</p>
                        <p style="margin: 0 0 8px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.4; color: #000080; font-weight: 700; text-align: left;">Archery Technocrats Pvt Limited</p>
                        <p style="margin: 0 0 8px 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; font-weight: 700; text-align: left;">
                          <span style="color:#FF0000;">|</span> Tidel Park
                          <span style="color:#FF0000;">|</span> Tambaram
                          <span style="color:#FF0000;">|</span> Madurai
                          <span style="color:#FF0000;">|</span> Bangalore
                          <span style="color:#FF0000;">|</span> Pune
                          <span style="color:#FF0000;">|</span> Hosur
                          <span style="color:#FF0000;">|</span>
                        </p>
                        <p style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; font-weight: 700; text-align: left;">ISO 9001:2015 Certified Company</p>
                        <p style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; color: #000000; font-weight: 700; text-align: left;">Mobile: +91 95512 88656</p>
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

    // Validation
    if (!email || !firstName) {
      console.log("⚠️ Missing required fields");
      return res.status(400).json({
        success: false,
        error: "Missing required fields (email, firstName)",
      });
    }

    if (!subject || !body) {
      console.log("⚠️ Missing template data");
      return res.status(400).json({
        success: false,
        error: "Missing template data (subject, body)",
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

    // ✅ Create dynamic transporter if sender credentials are provided
    let emailTransporter = transporter; // Default transporter

    if (senderEmail && senderPassword) {
      console.log(`📧 Using custom sender: ${senderEmail}`);

      // Create a new transporter with the sender's credentials
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

    // Replace template variables in subject
    const processedSubject = replaceTemplateVariables(
      subject,
      firstName,
      lastName
    );

    // Generate email HTML with frontend data
    const htmlContent = generateEmailHTML(
      firstName,
      lastName,
      processedSubject,
      body,
      signature,
      images
    );

    // ✅ Determine "from" address based on sender credentials
    const fromAddress = senderEmail
      ? `"${senderName || "Email Sender"}" <${senderEmail}>`
      : '"Archery Technocrats Pvt. Ltd." <info@atplgroup.com>';

    // Prepare mail options
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: processedSubject,
      html: htmlContent,
      attachments: [],
    };

    // Process embedded images
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`🖼️ Processing ${images.length} embedded image(s)...`);
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

          console.log(`   ✓ Embedded: ${image.filename}`);
        }
      });
    }

    // Process file attachments
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      console.log(`📎 Processing ${attachments.length} file attachment(s)...`);

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

          console.log(`   ✓ Attached: ${attachment.filename}`);
        }
      }
    }

    // Send email with timeout
    console.log(`📨 Attempting to send email to ${email}...`);
    console.log(`   From: ${fromAddress}`);
    console.log(`   Subject: ${processedSubject}`);
    if (mailOptions.attachments.length > 0) {
      console.log(
        `   With ${mailOptions.attachments.length} attachment(s)/image(s)`
      );
    }

    const info = await Promise.race([
      emailTransporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email timeout after 30s")), 30000)
      ),
    ]);

    console.log(
      `✅ Email sent successfully to ${email} (ID: ${info.messageId})`
    );

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

    // Determine error reason based on error code
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
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

// Start server
app.listen(Port, "0.0.0.0", () => {
  console.log(`🚀 Email server running on port ${Port}`);
  console.log(`📨 Ready to send emails via info@atplgroup.com`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📊 MongoDB Status: ${
      mongoose.connection.readyState === 1 ? "Connected" : "Connecting..."
    }`
  );
});
