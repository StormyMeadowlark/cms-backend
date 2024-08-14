// controllers/adminController.js
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.getDashboardData = async (req, res) => {
  try {
    // 1. Get the total number of users
    const usersCount = await User.countDocuments();

    // 2. Get the total number of posts
    const postsCount = await Post.countDocuments();

    // 3. Get the number of new users registered in the last 7 days
    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // 4. Get the number of posts created in the last 7 days
    const newPostsCount = await Post.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // 5. Get the number of comments made in the last 7 days
    const newCommentsCount = await Comment.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // 6. Get the number of likes on posts in the last 7 days
    const recentPosts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } },
    ]);
    const recentLikesCount = recentPosts[0]?.totalLikes || 0;

    // 7. Example: Get the 10 most recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("username email createdAt");

    // 8. Example: Get the 10 most recent posts
    const recentPostsList = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title author createdAt");

    // Prepare the final dashboard data
    const dashboardData = {
      usersCount,
      postsCount,
      newUsersCount,
      newPostsCount,
      newCommentsCount,
      recentLikesCount,
      recentUsers,
      recentPosts: recentPostsList,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Error fetching dashboard data" });
  }
};
