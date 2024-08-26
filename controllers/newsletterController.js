const Newsletter = require("../models/Newsletter");
const Subscriber = require("../models/Subscription");
const { sendEmail } = require("../config/transporter");
const { decrypt } = require("../config/config");
// Store the scheduled tasks in a map to manage rescheduling
const scheduledTasks = new Map();

// Create a new newsletter
exports.createNewsletter = async (req, res) => {
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
  const { id } = req.params;

  try {
    const newsletter = await Newsletter.findById(id);
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

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const existingSubscription = await Subscriber.findOne({ email });

    if (existingSubscription) {
      if (existingSubscription.isSubscribed) {
        return res.status(400).json({ message: "Already subscribed." });
      }
      existingSubscription.isSubscribed = true;
      await existingSubscription.save();
      return res.status(200).json({ message: "Subscription reactivated." });
    }

    const newSubscription = new Subscriber({ email });
    await newSubscription.save();
    return res.status(201).json({ message: "Subscribed successfully." });
  } catch (error) {
    console.error("Error subscribing:", error);
    return res.status(500).json({ message: "Error subscribing." });
  }
};

// Unsubscribe from a newsletter
exports.unsubscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const subscription = await Subscriber.findOne({ email });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    subscription.isSubscribed = false;
    await subscription.save();
    return res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return res.status(500).json({ message: "Error unsubscribing." });
  }
};

// Send a newsletter to all subscribers
exports.sendNewsletter = async (req, res) => {
  console.log("Received request body:", req.body); // Debugging line

  const { to, subject, text, html, verifiedSenderEmail, encryptedApiKey } =
    req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Missing required email fields." });
  }

  try {
    const apiKey = decrypt(encryptedApiKey);

    if (!apiKey) {
      throw new Error("Failed to decrypt API key.");
    }

    await sendEmail(to, verifiedSenderEmail, subject, text, html, apiKey);

    res.status(200).json({ message: "Newsletter sent successfully." });
  } catch (error) {
    console.error("Error sending newsletter:", error.message);
    res.status(500).json({ message: "Error sending newsletter" });
  }
};

// Schedule a newsletter
exports.scheduleNewsletter = async (req, res) => {
  const { id } = req.params;
  const { sendDate } = req.body;
  const tenant = req.tenant; // Assuming tenant is passed in the request or obtained in some other way

  try {
    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }

    if (newsletter.status === "Sent") {
      return res
        .status(400)
        .json({ message: "Cannot reschedule a sent newsletter." });
    }

    const cronSchedule = parseSendDateToCron(sendDate);

    // Stop any existing scheduled tasks
    if (scheduledTasks.has(id)) {
      const existingTask = scheduledTasks.get(id);
      existingTask.stop();
    }

    const task = cron.schedule(cronSchedule, async () => {
      try {
        await sendNewsletter({ params: { id }, tenant });
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
