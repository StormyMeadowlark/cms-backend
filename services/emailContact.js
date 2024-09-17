 // Import existing email service utilities
const nodemailer = require("nodemailer");
const axios = require("axios");
/**
 * Send contact form email using tenant-specific configuration.
 * @param {String} tenantId - The tenant ID.
 * @param {String} name - The name of the contact form submitter.
 * @param {String} email - The email of the contact form submitter.
 * @param {String} message - The message from the contact form.
 */
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





const sendContactEmail = async (tenantId, name, email, message) => {
  try {
    console.log(
      "[SEND CONTACT EMAIL] Fetching tenant info for tenant ID:",
      tenantId
    );

    // Fetch tenant-specific information with the x-tenant-id header
    const tenantInfo = await fetchTenantInfo(tenantId);

    if (!tenantInfo.sendGridApiKey) {
      throw new Error("SendGrid API key not found for tenant.");
    }

    // Create transporter with tenant-specific SendGrid API key
    const transporter = createTransporter(tenantInfo.sendGridApiKey);

    // Define email content
    const mailOptions = {
      from: tenantInfo.verifiedSenderEmail, // Use tenant's verified sender email
      to: process.env.CONTACT_EMAIL, // Send to the same verified sender email
      subject: "New Contact Form Submission",
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    console.log(
      "[SEND CONTACT EMAIL] Sending email to:",
      tenantInfo.verifiedSenderEmail
    );
    await transporter.sendMail(mailOptions);
    console.log("[SEND CONTACT EMAIL] Contact email sent successfully.");
  } catch (error) {
    console.error(
      `[SEND CONTACT EMAIL] Error sending contact email:`,
      error.message
    );
    throw error;
  }
};

module.exports = { sendContactEmail };
