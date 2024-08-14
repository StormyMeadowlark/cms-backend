const Newsletter = require("../models/Newsletter");
const { DateTime } = require("luxon"); // Assuming you're using Luxon for scheduling
const cron = require("node-cron");
const dotenv = require("dotenv");
dotenv.config();
const Subscriber = require("../models/Subscription")
const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
const transporter = require("../config/transporter");

// Create a new newsletter
exports.createNewsletter = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json({
        message: "Title and content are required to create a newsletter.",
      });
  }

  try {
    const newsletter = new Newsletter({
      title,
      content,
      status: "Draft",
    });

    await newsletter.save();

    return res.status(201).json({
      message: "Newsletter created successfully.",
      newsletter,
    });
  } catch (error) {
    console.error("Server error during newsletter creation process:", error);
    return res.status(500).json({
      message: "Server error occurred during newsletter creation.",
    });
  }
};
// Store the scheduled tasks in a map to manage rescheduling
const scheduledTasks = new Map();

// Schedule or reschedule a newsletter
exports.scheduleNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendDate } = req.body;

    // Find the newsletter by ID
    const newsletter = await Newsletter.findById(id);

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }

    if (newsletter.status === "Sent") {
      return res
        .status(400)
        .json({ message: "Cannot reschedule a sent newsletter." });
    }

    // Parse the sendDate into a cron schedule format (e.g., '0 9 * * *' for 9:00 AM every day)
    const cronSchedule = parseSendDateToCron(sendDate);

    // If a task is already scheduled for this newsletter, unschedule it
    if (scheduledTasks.has(id)) {
      const existingTask = scheduledTasks.get(id);
      existingTask.stop();
    }

    // Schedule the newsletter to be sent at the specified date and time
    const task = cron.schedule(cronSchedule, async () => {
      try {
        await sendNewsletter(newsletter._id); // Assuming you have a function to send the newsletter
        newsletter.status = "Sent";
        newsletter.sendDate = new Date();
        await newsletter.save();

        // Remove the task from the map once it's completed
        scheduledTasks.delete(id);
      } catch (error) {
        console.error("Error sending scheduled newsletter:", error);
      }
    });

    // Store the task in the map to manage it later if needed
    scheduledTasks.set(id, task);

    // Update the status to Scheduled and save the scheduled date
    newsletter.status = "Scheduled";
    newsletter.sendDate = sendDate;
    await newsletter.save();

    res
      .status(200)
      .json({ message: "Newsletter scheduled successfully", newsletter });
  } catch (error) {
    console.error("Error scheduling newsletter:", error);
    res
      .status(500)
      .json({ message: "Server error occurred during scheduling." });
  }
};

// Helper function to convert the sendDate to a cron schedule
function parseSendDateToCron(sendDate) {
  const date = new Date(sendDate);
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-based in JS
  return `${minutes} ${hours} ${dayOfMonth} ${month} *`;
}

// Function to send the newsletter (you need to implement this)
async function sendNewsletter(newsletterId) {
  // Logic to send the newsletter
}


// Helper function to send the newsletter (using your sendNewsletter logic)
async function sendNewsletter(newsletter) {
  // Implement your email sending logic here using SendGrid or Nodemailer
}


exports.updateNewsletter = async (req, res) => {
  const { id } = req.params;
  const { title, content, sendDate, status } = req.body;

  try {
    const newsletter = await Newsletter.findById(id);

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }

    // Update the fields
    if (title) newsletter.title = title;
    if (content) newsletter.content = content;
    if (sendDate) {
      const sendDateTime = DateTime.fromISO(sendDate);
      const now = DateTime.now();

      if (sendDateTime <= now) {
        return res
          .status(400)
          .json({ message: "Send date must be in the future." });
      }

      newsletter.sendDate = sendDateTime.toJSDate();
    }
    if (status) newsletter.status = status;

    await newsletter.save();

    return res.status(200).json({
      message: "Newsletter updated successfully.",
      newsletter,
    });
  } catch (error) {
    console.error("Server error during newsletter update process:", error);
    return res
      .status(500)
      .json({ message: "Server error occurred during newsletter update." });
  }
};



exports.subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required for subscription." });
  }

  try {
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      if (subscriber.isSubscribed) {
        return res.status(400).json({ message: "You are already subscribed." });
      } else {
        subscriber.isSubscribed = true;
        await subscriber.save();
        return res.status(200).json({ message: "Subscription reactivated." });
      }
    }

    subscriber = new Subscriber({ email });
    await subscriber.save();

    const mailOptions = {
      from: "ashlee@stormymeadowlark.com",
      to: email,
      subject: "Welcome to Our Newsletter!",
      text: "Hello and welcome!",
      html: "<b>Hello and welcome to our newsletter!</b>",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending welcome email via Nodemailer:", error);
        return res.status(500).json({ message: "Failed to send welcome email." });
      }

      console.log("Welcome email sent: " + info.response);
      return res.status(200).json({ message: "Subscription successful" });
    });
  } catch (error) {
    console.error("Server error during subscription process:", error);
    return res.status(500).json({ message: "Server error occurred during subscription." });
  }
};

exports.unsubscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required to unsubscribe." });
  }

  try {
    let subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    if (!subscriber.isSubscribed) {
      return res.status(400).json({ message: "You are already unsubscribed." });
    }

    subscriber.isSubscribed = false;
    await subscriber.save();

    const mailOptions = {
      from: "ashlee@stormymeadowlark.com",
      to: email,
      subject: "You have been unsubscribed",
      text: "You have successfully unsubscribed from our newsletter.",
      html: "<b>You have successfully unsubscribed from our newsletter.</b>",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(
          "Error sending unsubscribe confirmation email via Nodemailer:",
          error
        );
        return res
          .status(500)
          .json({ message: "Failed to send unsubscribe confirmation email." });
      }

      console.log("Unsubscribe confirmation email sent: " + info.response);
      return res.status(200).json({ message: "Unsubscribed successfully." });
    });
  } catch (error) {
    console.error("Server error during unsubscription process:", error);
    return res
      .status(500)
      .json({ message: "Server error occurred during unsubscription." });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscription.find({ isActive: true }).select(
      "email subscribedAt"
    );

    res.status(200).json(subscribers);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching subscribers", details: error });
  }
};

exports.sendNewsletter = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Newsletter ID is required." });
  }

  try {
    // Find the newsletter by ID
    const newsletter = await Newsletter.findById(id);

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }

    if (newsletter.status === "Sent") {
      return res
        .status(400)
        .json({ message: "Newsletter has already been sent." });
    }

    // Get all active subscribers
    const subscribers = await Subscriber.find({ isSubscribed: true });

    if (subscribers.length === 0) {
      return res.status(400).json({ message: "No active subscribers found." });
    }

    const subject = newsletter.title;
    const text = newsletter.content;
    const html = `<p>${newsletter.content}</p>`;

    // Send the newsletter to all subscribers
    let emailSendErrors = [];
    for (const subscriber of subscribers) {
      const mailOptions = {
        from: "ashlee@stormymeadowlark.com",
        to: subscriber.email,
        subject: subject,
        text: text,
        html: html,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Newsletter sent to ${subscriber.email}`);
      } catch (error) {
        console.error(
          `Error sending newsletter to ${subscriber.email}:`,
          error
        );
        emailSendErrors.push(subscriber.email);
      }
    }

    // Update the status of the newsletter
    newsletter.status = "Sent";
    newsletter.sendDate = new Date();
    await newsletter.save();

    if (emailSendErrors.length > 0) {
      return res.status(500).json({
        message: "Newsletter sent with some errors.",
        errors: emailSendErrors,
      });
    }

    return res.status(200).json({ message: "Newsletter sent successfully." });
  } catch (error) {
    console.error("Server error during newsletter sending process:", error);
    return res
      .status(500)
      .json({ message: "Server error occurred during newsletter sending." });
  }
};

exports.getNewsletterById = async (req, res) => {
  try {
    const { id } = req.params; // Get the newsletter ID from the request parameters

    // Find the newsletter by its ID
    const newsletter = await Newsletter.findById(id);

    if (!newsletter) {
      return res.status(404).json({ message: "Newsletter not found." });
    }

    // Return the found newsletter
    res.status(200).json(newsletter);
  } catch (error) {
    console.error("Error fetching newsletter by ID:", error);
    res
      .status(500)
      .json({
        message: "Server error occurred while fetching the newsletter.",
      });
  }
};
