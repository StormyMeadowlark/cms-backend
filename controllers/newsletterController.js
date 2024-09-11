const Newsletter = require("../models/Newsletter");
const Subscriber = require("../models/Subscription");
const { sendEmail } = require("../services/emailService");
const { sendEmailNewsletter } = require ("../services/emailNewsletter")
const jwt = require('jsonwebtoken')
const axios = require('axios');
const cron = require('node-cron');
const { DateTime } = require('luxon');

// Store the scheduled tasks in a map to manage rescheduling
const scheduledTasks = new Map();

// Create a new newsletter
exports.createNewsletter = async (req, res) => {
  console.log("[createNewsletter] Incoming request:", req.body, req.params);
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const newsletter = new Newsletter({ title, content, status: "Draft" });
    await newsletter.save();
    return res
      .status(201)
      .json({ message: "Newsletter created successfully.", newsletter });
  } catch (error) {
    console.error("Error creating newsletter:", error);
    return res.status(500).json({ message: "Error creating newsletter." });
  }
};

// Update an existing newsletter
exports.updateNewsletter = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const newsletter = await Newsletter.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }
    return res
      .status(200)
      .json({ message: "Newsletter updated successfully.", newsletter });
  } catch (error) {
    console.error("Error updating newsletter:", error);
    return res.status(500).json({ message: "Error updating newsletter." });
  }
};

// Delete a newsletter
exports.deleteNewsletter = async (req, res) => {
  const { id } = req.params;

  try {
    const newsletter = await Newsletter.findByIdAndDelete(id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }
    return res
      .status(200)
      .json({ message: "Newsletter deleted successfully." });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    return res.status(500).json({ message: "Error deleting newsletter." });
  }
};

// Get all newsletters
exports.getAllNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find();
    return res.status(200).json(newsletters);
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return res.status(500).json({ message: "Error fetching newsletters." });
  }
};

// Get a newsletter by ID
exports.getNewsletterById = async (req, res) => {
  const { _id } = req.params;

  try {
    const newsletter = await Newsletter.findById(_id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }
    return res.status(200).json(newsletter);
  } catch (error) {
    console.error("Error fetching newsletter by ID:", error);
    return res.status(500).json({ message: "Error fetching newsletter." });
  }
};

// Subscribe to a newsletter
exports.subscribe = async (req, res) => {
  const { email } = req.body;
  const tenantId = req.headers["x-tenant-id"]; // Retrieve tenant ID from header

  console.log("[SUBSCRIBE] Incoming request:");
  console.log("[SUBSCRIBE] Tenant ID:", tenantId);
  console.log("[SUBSCRIBE] Email:", email);

  if (!email) {
    console.log("[SUBSCRIBE] Error: Email is required.");
    return res.status(400).json({ message: "Email is required." });
  }

  if (!tenantId) {
    console.log("[SUBSCRIBE] Error: Tenant ID is required.");
    return res.status(400).json({ message: "Tenant ID is required." });
  }

  try {
    // Check if the subscriber already exists
    let subscriber = await Subscriber.findOne({ email, tenantId });
    console.log("[SUBSCRIBE] Checking existing subscriber:", subscriber);

    if (!subscriber) {
      console.log("[SUBSCRIBE] Creating new subscriber.");
      subscriber = new Subscriber({ email, tenantId });
      await subscriber.save();
    } else {
      console.log(
        "[SUBSCRIBE] Subscriber found. Updating subscription status."
      );
      subscriber.isSubscribed = true;
      await subscriber.save();
    }

    console.log("[SUBSCRIBE] Sending confirmation email...");
    await sendEmail(tenantId, email, "subscribe", {
      first_name: "Subscriber",
    });

    console.log("[SUBSCRIBE] Confirmation email sent successfully.");
    return res.status(200).json({ message: "Subscribed successfully." });
  } catch (error) {
    console.error("[SUBSCRIBE] Error during subscription:", error.message);
    return res.status(500).json({ message: "Error subscribing." });
  }
};

// Unsubscribe from a newsletter
exports.unsubscribe = async (req, res) => {
  const { email } = req.body;
  const { tenantId } = req; // Retrieve tenantId from the request object

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Ensure the tenantId is available
    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required." });
    }

    // Find the subscription by email and tenantId
    const subscription = await Subscriber.findOne({ email, tenantId });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    subscription.isSubscribed = false;
    await subscription.save();
    return res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("Error unsubscribing:", error.message);
    return res.status(500).json({ message: "Error unsubscribing." });
  }
};

// Send a newsletter to all subscribers


// Helper function to fetch tenant information from an external API
const fetchTenantInfo = async (tenantId) => {
  try {
    console.log(
      "[FETCH TENANT INFO] Fetching information for tenant ID:",
      tenantId
    );

    // Make an HTTP GET request to the external API to fetch tenant information
    const response = await axios.get(
      `https://skynetrix-user-management-ad21b5714f45.herokuapp.com/api/tenants/${tenantId}`,
      {
        headers: {
          "x-tenant-id": tenantId, // Include the x-tenant-id header
        },
      }
    );

    if (response.status !== 200 || !response.data) {
      throw new Error("Failed to fetch tenant information.");
    }

    const tenantInfo = response.data;
    console.log("[FETCH TENANT INFO] Tenant information fetched:", tenantInfo);

    return {
      sendGridApiKey: tenantInfo.sendGridApiKey, // Adjust based on the actual API response structure
      verifiedSenderEmail: tenantInfo.verifiedSenderEmail, // Adjust based on the actual API response structure
    };
  } catch (error) {
    console.error(
      "[FETCH TENANT INFO] Error fetching tenant information:",
      error.message
    );
    throw error;
  }
};
// Authorization middleware to check for valid token
const authorize = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is required.' });
  }

  const token = authHeader.split(' ')[1]; // Assuming 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'Token is missing or invalid.' });
  }

  try {
    // Verify the token (adjust according to your authorization method)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key
    req.user = decoded; // Attach decoded user info to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token or unauthorized.' });
  }
};

// Send a newsletter to all subscribers
exports.sendNewsletter = [
  authorize,
  async (req, res) => {
    console.log("Received request headers:", req.headers);
    console.log("Received request params:", req.params);

    const tenantId = req.headers["x-tenant-id"]; // Extract tenant ID from the header
    const { id: newsletterId } = req.params; // Extract newsletter ID from URL params

    if (!newsletterId || !tenantId) {
      return res
        .status(400)
        .json({ message: "Newsletter ID and tenant ID are required." });
    }

    try {
      // Fetch tenant-specific information once
      const tenantInfo = await fetchTenantInfo(tenantId);
      console.log("[SEND NEWSLETTER] Tenant info fetched:", tenantInfo);

      if (!tenantInfo.sendGridApiKey) {
        throw new Error("SendGrid API key not found for the tenant.");
      }

      // Fetch the newsletter
      const newsletter = await Newsletter.findById(newsletterId);

      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found." });
      }

      console.log("[SEND NEWSLETTER] Newsletter fetched:", newsletter);

      // Fetch all subscribers for the tenant
      const subscribers = await Subscriber.find({
        tenantId,
        isSubscribed: true,
      });

      if (!subscribers || subscribers.length === 0) {
        console.error(
          "[SEND NEWSLETTER] No subscribers found for this tenant."
        );
        return res
          .status(404)
          .json({ message: "No subscribers found for this tenant." });
      }

      console.log("[SEND NEWSLETTER] Subscribers fetched:", subscribers);

      let successCount = 0;
      let failureCount = 0;
      let failedEmails = [];

      // Iterate over each subscriber and attempt to send the newsletter
      for (const subscriber of subscribers) {
        try {
          await sendEmailNewsletter(
            tenantId,
            subscriber.email,
            {
              newsletterId: newsletterId,
              dynamicData: {},
            },
            tenantInfo
          );
          console.log(`Newsletter sent to ${subscriber.email}`);
          successCount++;
        } catch (emailError) {
          console.error(
            `Error sending email to ${subscriber.email}:`,
            emailError.message
          );
          failureCount++;
          failedEmails.push(subscriber.email); // Keep track of failed emails
        }
      }

      // Update the newsletter status only if some emails were successfully sent
      if (successCount > 0) {
        newsletter.status = "Sent";
        await newsletter.save();
      }

      // If all emails failed
      if (failureCount === subscribers.length) {
        return res.status(500).json({
          message: "Failed to send newsletter to all subscribers.",
          failedEmails,
        });
      }

      // Respond with a mixed status if some emails failed but others were sent
      return res.status(200).json({
        message: `Newsletter sent with ${successCount} successes and ${failureCount} failures.`,
        failedEmails,
      });
    } catch (error) {
      console.error("Error sending newsletter:", error.message);
      res.status(500).json({ message: "Error sending newsletter." });
    }
  },
];

// Schedule a newsletter
exports.scheduleNewsletter = async (req, res) => {
  const { id } = req.params;
  const { sendDate } = req.body;
  const tenantId = req.headers["x-tenant-id"]; // Assuming tenant ID is passed in headers

  try {
    // Fetch tenant-specific information
    const tenantInfo = await fetchTenantInfo(tenantId);
    if (!tenantInfo) {
      return res.status(400).json({ message: "Invalid tenant information." });
    }

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }

    if (newsletter.status === "Sent") {
      return res
        .status(400)
        .json({ message: "Cannot reschedule a sent newsletter." });
    }

    // Validate sendDate
    if (!DateTime.fromISO(sendDate).isValid) {
      return res.status(400).json({ message: "Invalid send date." });
    }

    if (DateTime.fromISO(sendDate) <= DateTime.now()) {
      return res
        .status(400)
        .json({ message: "Send date must be in the future." });
    }

    const cronSchedule = parseSendDateToCron(sendDate);

    // Stop any existing scheduled tasks
    if (scheduledTasks.has(id)) {
      const existingTask = scheduledTasks.get(id);
      existingTask.stop();
      scheduledTasks.delete(id);
    }

    const task = cron.schedule(cronSchedule, async () => {
      try {
        await sendNewsletter({ params: { id }, tenant: tenantInfo }); // Pass tenantInfo correctly
        newsletter.status = "Sent";
        newsletter.sendDate = new Date();
        await newsletter.save();
        scheduledTasks.delete(id);
      } catch (error) {
        console.error("Error sending scheduled newsletter:", error);
      }
    });

    scheduledTasks.set(id, task);
    return res
      .status(200)
      .json({ message: "Newsletter scheduled successfully." });
  } catch (error) {
    console.error("Error scheduling newsletter:", error);
    return res.status(500).json({ message: "Error scheduling newsletter." });
  }
};

// Helper function to parse sendDate to cron format
const parseSendDateToCron = (sendDate) => {
  const dt = DateTime.fromISO(sendDate);
  return `${dt.second} ${dt.minute} ${dt.hour} ${dt.day} ${dt.month} *`;
};


// Get all subscribers for a specific tenant
exports.getAllSubscribers = async (req, res) => {
  try {
    const { tenantId } = req.params; // Correctly extract tenantId from request parameters

    // Find all subscribers associated with the given tenantId
    const subscribers = await Subscriber.find({ tenantId });
    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Error fetching subscribers:", error.message);
    res.status(500).json({ message: "Error fetching subscribers." });
  }
};

// Get a single subscriber by ID
exports.getSubscriberById = async (req, res) => {
  try {
    const { id } = req.params; // Extract subscriber ID from request parameters

    // Use findById to search for a subscriber using the ObjectId
    const subscriber = await Subscriber.findById(id);

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    res.status(200).json(subscriber);
  } catch (error) {
    console.error("Error fetching subscriber by ID:", error.message);
    res.status(500).json({ message: "Error fetching subscriber by ID." });
  }
};