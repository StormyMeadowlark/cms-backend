// controllers/socialMediaController.js

const SocialMediaPost = require("../models/SocialMediaPost");
const cron = require("node-cron");
const scheduledTasks = new Map();

// Create a new social media post
exports.createPost = async (req, res) => {
  try {
    const { content, platform, status, publishDate } = req.body;

    const post = new SocialMediaPost({
      content,
      platform,
      status,
      publishDate: status === "Scheduled" ? publishDate : undefined,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating social media post:", error);
    res.status(500).json({ error: "Error creating social media post" });
  }
};

// Update an existing social media post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, platform, status, publishDate } = req.body;

    const post = await SocialMediaPost.findByIdAndUpdate(
      id,
      { content, platform, status, publishDate },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Social media post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating social media post:", error);
    res.status(500).json({ error: "Error updating social media post" });
  }
};

// Schedule a social media post
exports.schedulePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { publishDate } = req.body;

    const post = await SocialMediaPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Social media post not found" });
    }

    if (post.status === "Published") {
      return res
        .status(400)
        .json({ error: "Cannot schedule a post that is already published" });
    }

    // Parse the publish date and create a cron schedule
    const cronSchedule = parsePublishDateToCron(publishDate);

    // If a task is already scheduled, stop it
    if (scheduledTasks.has(id)) {
      const existingTask = scheduledTasks.get(id);
      existingTask.stop();
    }

    // Schedule the post
    const task = cron.schedule(cronSchedule, async () => {
      try {
        post.status = "Published";
        post.publishDate = new Date();
        await post.save();
        scheduledTasks.delete(id);
      } catch (error) {
        console.error("Error publishing scheduled post:", error);
      }
    });

    scheduledTasks.set(id, task);

    post.status = "Scheduled";
    post.publishDate = publishDate;
    await post.save();

    res.status(200).json({ message: "Post scheduled successfully", post });
  } catch (error) {
    console.error("Error scheduling social media post:", error);
    res.status(500).json({ error: "Error scheduling social media post" });
  }
};

// Publish a social media post immediately
exports.publishPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await SocialMediaPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Social media post not found" });
    }

    if (post.status === "Published") {
      return res
        .status(400)
        .json({ error: "This post has already been published" });
    }

    post.status = "Published";
    post.publishDate = new Date();
    await post.save();

    // If there was a scheduled task, remove it
    if (scheduledTasks.has(id)) {
      const existingTask = scheduledTasks.get(id);
      existingTask.stop();
      scheduledTasks.delete(id);
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error publishing social media post:", error);
    res.status(500).json({ error: "Error publishing social media post" });
  }
};

// Helper function to convert the publish date to a cron schedule
function parsePublishDateToCron(publishDate) {
  const date = new Date(publishDate);
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-based in JS
  return `${minutes} ${hours} ${dayOfMonth} ${month} *`;
}
