const Analytics = require("../models/Analytics");
const Post = require("../models/Post");

// Record a view for a post
exports.recordView = async (req, res) => {
  try {
    const { postId } = req.params;

    // Find the post's analytics data
    let analytics = await Analytics.findOne({ post: postId });

    if (!analytics) {
      // If no analytics data exists for this post, create a new record
      analytics = new Analytics({
        post: postId,
        views: 0,
        likes: 0,
        dislikes: 0,
      });
    }

    // Increment the views count
    analytics.views += 1;
    await analytics.save();

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error recording view:", error);
    res.status(500).json({ error: "Error recording view" });
  }
};

// Retrieve analytics for a specific post
exports.getAnalyticsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const analytics = await Analytics.findOne({ post: postId });

    if (!analytics) {
      return res.status(404).json({ error: "Analytics data not found" });
    }

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ error: "Error fetching analytics data" });
  }
};

// Retrieve all analytics data (admin-only)
exports.getAllAnalytics = async (req, res) => {
  try {
    const analyticsData = await Analytics.find().populate("post", "title");

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ error: "Error fetching analytics data" });
  }
};
