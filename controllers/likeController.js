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

    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already liked this post" });
    }

    // Remove user from dislikes array if they had previously disliked the post
    post.dislikes.pull(userId);

    // Add user to likes array
    post.likes.push(userId);

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error liking post:", error);
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

    // Check if user already disliked the post
    if (post.dislikes.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already disliked this post" });
    }

    // Remove user from likes array if they had previously liked the post
    post.likes.pull(userId);

    // Add user to dislikes array
    post.dislikes.push(userId);

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error disliking post:", error);
    res.status(500).json({ error: "Error disliking post" });
  }
};
