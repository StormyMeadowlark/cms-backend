const sendEmail = async (tenantId, to, templateType, dynamicData) => {
  try {
    console.log("[SEND EMAIL] Fetching tenant info for tenant ID:", tenantId);

    // Fetch tenant-specific information
    const tenantInfo = await fetchTenantInfo(tenantId);
    console.log("[SEND EMAIL] Tenant info fetched:", tenantInfo);

    // Fetch the correct email template from the database
    const emailTemplate = await EmailTemplate.findOne({
      tenantId: tenantId,
      templateType: templateType,
    });

    if (!emailTemplate) {
      throw new Error("Email template not found for tenant.");
    }

    console.log("[SEND EMAIL] Email template fetched:", emailTemplate);

    const transporter = createTransporter(tenantInfo.sendGridApiKey);

    const mailOptions = {
      from: tenantInfo.verifiedSenderEmail,
      to,
      subject: emailTemplate.subject,
      html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to the Stormy Meadowlark Newsletter!</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Century Gothic', Arial, sans-serif; background-color: #f7faff; color: #2c3e50;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <!-- Header Section -->
      <div style="background: linear-gradient(45deg, #ff7e5f, #feb47b); padding: 30px; text-align: center; color: #ffffff;">
        <img src="http://cdn.mcauto-images-production.sendgrid.net/ac3a414a5aabf002/0d03005b-d00b-4a09-b21f-d2106b21c6d0/500x500.png" alt="Stormy Meadowlark Logo" style="width: 120px; margin-bottom: 20px;" />
        <h1 style="font-size: 24px; margin: 0; font-weight: bold;">Welcome, Stormy Star!</h1>
      </div>

      <!-- Content Section -->
      <div style="padding: 20px; text-align: left; line-height: 1.6;">
        <h2>Hello, {{first_name}}!</h2>
        <p>
          We're so excited to welcome you as one of our <strong>Stormy Stars</strong>! By joining our newsletter, you’ve taken a step toward shining brighter in your business journey.
        </p>
        <p>
          Here's what you can expect as a Stormy Star:
        </p>
        <ul>
          <li>🌟 <strong>Exclusive insights and tips</strong> on digital marketing, branding, and web development.</li>
          <li>📅 <strong>Invitations to special events</strong> like webinars, workshops, and live Q&A sessions.</li>
          <li>📰 <strong>Updates on our latest projects</strong> and behind-the-scenes stories from Stormy Meadowlark.</li>
          <li>🎁 <strong>Special offers and discounts</strong> available only to our stars.</li>
        </ul>
        <p>
          As a Stormy Star, we’re here to help you shine brighter, find tranquility among the storm, and grow your business with confidence.
        </p>
        <p>
          In the meantime, feel free to explore our website and discover more about the services we offer.
        </p>
        <a href="https://stormymeadowlark.com/services" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #0057b7; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore Our Services</a>
      </div>

      <!-- Footer Section -->
      <div style="padding: 20px; text-align: center; font-size: 12px; color: #888888; line-height: 1.5;">
        <p>
          Have questions? Need help? Reach out to us at
          <a href="mailto:contact@stormymeadowlark.com" style="color: #0057b7; text-decoration: none;">contact@stormymeadowlark.com</a>.
        </p>
        <p>
          Follow us on:
          <a href="https://facebook.com/stormymeadowlark" target="_blank" style="color: #0057b7; text-decoration: none;">Facebook</a>,
          <a href="https://instagram.com/stormymeadowlark" target="_blank" style="color: #0057b7; text-decoration: none;">Instagram</a>,
          <a href="https://linkedin.com/company/stormymeadowlark" target="_blank" style="color: #0057b7; text-decoration: none;">LinkedIn</a>
        </p>
        <p>
          If you’d like to unsubscribe from our emails, click
          <a href="{{{unsubscribe}}}" target="_blank" style="color: #0057b7; text-decoration: none;">here</a>.
        </p>
      </div>
    </div>
  </body>
</html>`, // Set HTML content properly
    };

    console.log("[SEND EMAIL] Mail options:", mailOptions);
    await transporter.sendMail(mailOptions);
    console.log("[SEND EMAIL] Email sent successfully to:", to);
  } catch (error) {
    console.error("[SEND EMAIL] Error sending email:", error.message);
    throw error;
  }
};
