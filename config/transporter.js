const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Create a transporter using SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net", // SendGrid SMTP server
  port: 587, // Use port 587 for TLS
  secure: false, // Use false for TLS
  auth: {
    user: "apikey", // This is the literal string 'apikey'
    pass: process.env.SEND_GRID_API_KEY, // Your SendGrid API key from the .env file
  },
});

module.exports = transporter;
