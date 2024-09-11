const nodemailer = require("nodemailer");
const axios = require("axios");
const EmailTemplate = require("../models/EmailTemplate");
const Newsletter = require("../models/Newsletter"); // Ensure this import is added

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

// Function to send an email using tenant-specific config and template or newsletter
const sendEmailNewsletter = async (tenantId, to, options = {}, tenantInfo) => {
  const { templateType, dynamicData, newsletterId } = options; // Extract options

  try {
    console.log("[SEND EMAIL] Using tenant info for tenant ID:", tenantId);

    if (!tenantInfo || !tenantInfo.sendGridApiKey) {
      throw new Error("SendGrid API key not found for tenant.");
    }

    // Validate recipient email
    if (!to || !/\S+@\S+\.\S+/.test(to)) {
      console.error("[SEND EMAIL] Invalid recipient email:", to);
      throw new Error("Invalid recipient email address.");
    }

    let emailContent;
    let subject;

    if (newsletterId) {
      // Fetch the newsletter content from the database if a newsletter ID is provided
      const newsletter = await Newsletter.findById(newsletterId);

      if (!newsletter) {
        console.error(
          `[SEND EMAIL] Newsletter with ID '${newsletterId}' not found.`
        );
        throw new Error("Newsletter not found.");
      }

      console.log("[SEND EMAIL] Newsletter fetched:", newsletter);

      emailContent = `<p>${newsletter.content}</p>`; // Use newsletter content
      subject = newsletter.title; // Use newsletter title as subject
    } else if (templateType) {
      // Fetch the correct email template from the database if templateType is provided
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
      emailContent = emailTemplate.htmlContent;
      if (dynamicData) {
        for (const key in dynamicData) {
          const regex = new RegExp(`{{${key}}}`, "g");
          emailContent = emailContent.replace(regex, dynamicData[key]);
        }
      }
      subject = emailTemplate.subject;
    } else {
      // If neither newsletterId nor templateType is provided, throw an error
      throw new Error("Either newsletterId or templateType must be provided.");
    }

    const transporter = createTransporter(tenantInfo.sendGridApiKey);

    const mailOptions = {
      from: tenantInfo.verifiedSenderEmail,
      to,
      subject,
      html: emailContent,
    };

    console.log("[SEND EMAIL] Sending email to:", to);
    await transporter.sendMail(mailOptions);
    console.log("[SEND EMAIL] Email sent successfully to:", to);
  } catch (error) {
    console.error(`[SEND EMAIL] Error sending email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendEmailNewsletter };
