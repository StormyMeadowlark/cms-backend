const nodemailer = require("nodemailer");

// Function to create a transporter dynamically based on tenant
const createTransporter = (sendGridApiKey) => {
  return nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey", // This is the literal string 'apikey'
      pass: sendGridApiKey, // Pass the tenant-specific SendGrid API key
    },
  });
};

module.exports = createTransporter;
