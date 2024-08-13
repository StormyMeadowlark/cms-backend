// controllers/likeController.js

const Post = require("../models/Post");

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Remove user from dislikes array if they had previously disliked the post
    if (post.dislikes.includes(userId)) {
      post.dislikes.pull(userId);
    }

    // Add user to likes array if they haven't liked the post yet
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    } else {
      return res
        .status(400)
        .json({ error: "You have already liked this post" });
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error liking post" });
  }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Remove user from likes array if they had previously liked the post
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    }

    // Add user to dislikes array if they haven't disliked the post yet
    if (!post.dislikes.includes(userId)) {
      post.dislikes.push(userId);
    } else {
      return res
        .status(400)
        .json({ error: "You have already disliked this post" });
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error disliking post" });
  }
};
