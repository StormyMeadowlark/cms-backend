const { sendContactEmail } = require("../services/emailContact"); // Import the contact email service

// Handle contact form submission
exports.submitContactForm = async (req, res) => {
  const { tenantId } = req.params; // Extract tenantId from the URL
  const { name, email, message } = req.body; // Get form data from request body

  // Basic validation of form data
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "All fields (name, email, message) are required." });
  }

  try {
    // Send contact email using the new service
    await sendContactEmail(tenantId, name, email, message);

    // Respond with a success message
    res
      .status(200)
      .json({
        message: "Thank you for contacting us. We will get back to you soon.",
      });
  } catch (error) {
    console.error("[CONTACT FORM SUBMISSION] Error:", error.message);
    res
      .status(500)
      .json({
        error:
          "An error occurred while submitting the form. Please try again later.",
      });
  }
};
