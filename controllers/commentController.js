// controllers/commentController.js

const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    const comment = new Comment({
      content,
      author: req.user._id, // Assuming the user is authenticated
      post: postId,
    });

    await comment.save();

    // Add the comment to the post
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
};

// Get comments by post
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comments" });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Only allow the author or admin to update the comment
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error updating comment" });
  }
};

// Delete a comment
// controllers/commentController.js

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Only allow the author or admin to delete the comment
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete the comment
    await Comment.deleteOne({ _id: id });

    // Remove the comment reference from the associated post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Error deleting comment" });
  }
};
