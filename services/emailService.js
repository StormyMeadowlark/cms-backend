const nodemailer = require("nodemailer");
const axios = require("axios");
const EmailTemplate = require("../models/EmailTemplate");

// Function to create a transporter with tenant-specific config
const createTransporter = (sendGridApiKey) => {
  return nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey", // This is the fixed user for SendGrid
      pass: sendGridApiKey, // Tenant-specific SendGrid API key
    },
    debug: true,
    logger: true,
  });
};

// Function to fetch tenant-specific information
const fetchTenantInfo = async (tenantId) => {
  try {
    console.log(
      "[FETCH TENANT INFO] Fetching tenant information for tenant ID:",
      tenantId
    );

    // Make the request without the Authorization header
    const response = await axios.get(
      `${process.env.TENANT_SERVICE_URL}/${tenantId}`,
      {
        headers: {
          "x-tenant-id": tenantId, // Only include necessary headers
        },
      }
    );

    console.log(
      "[FETCH TENANT INFO] Tenant information received:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `[FETCH TENANT INFO] Error fetching tenant information for tenant ID ${tenantId}:`,
      error.message
    );
    throw new Error("Failed to retrieve tenant information.");
  }
};

// Function to send an email using tenant-specific config and template
const sendEmail = async (tenantId, to, templateType, dynamicData) => {
  try {
    console.log("[SEND EMAIL] Fetching tenant info for tenant ID:", tenantId);

    // Fetch tenant-specific information
    const tenantInfo = await fetchTenantInfo(tenantId);
    console.log("[SEND EMAIL] Tenant info fetched:", tenantInfo);

    if (!tenantInfo.sendGridApiKey) {
      throw new Error("SendGrid API key not found for tenant.");
    }

    // Validate recipient email
    if (!to || !/\S+@\S+\.\S+/.test(to)) {
      console.error("[SEND EMAIL] Invalid recipient email:", to);
      throw new Error("Invalid recipient email address.");
    }

    // Fetch the correct email template from the database
    const emailTemplate = await EmailTemplate.findOne({
      tenantId: tenantId,
      templateType: templateType,
    });

    if (!emailTemplate) {
      console.error(
        `[SEND EMAIL] Email template of type '${templateType}' not found for tenant ID: ${tenantId}.`
      );
      throw new Error("Email template not found for tenant.");
    }

    console.log("[SEND EMAIL] Email template fetched:", emailTemplate);

    // Replace placeholders with dynamic data
    let htmlContent = emailTemplate.htmlContent;
    if (dynamicData) {
      for (const key in dynamicData) {
        const regex = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(regex, dynamicData[key]);
      }
    }

    const transporter = createTransporter(tenantInfo.sendGridApiKey);

    const mailOptions = {
      from: tenantInfo.verifiedSenderEmail,
      to,
      subject: emailTemplate.subject,
      html: htmlContent,
    };

    console.log("[SEND EMAIL] Sending email to:", to);
    await transporter.sendMail(mailOptions);
    console.log("[SEND EMAIL] Email sent successfully to:", to);
  } catch (error) {
    console.error(`[SEND EMAIL] Error sending email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendEmail };
