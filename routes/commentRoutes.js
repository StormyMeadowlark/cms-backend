// routes/commentRoutes.js

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post(
  ":tenantId/:postId",
  commentController.createComment
); // Add a new comment to a post
router.get(":tenantId/:postId", commentController.getCommentsByPost); // Get all comments for a post
router.get(":tenantId/:postId/:commentId", commentController.getCommentById); // Get all comments for a post

// Protected routes (for admin or the author of the comment)
router.delete(
  ":tenantId/:postId/:commentId", authMiddleware,
  commentController.deleteComment
); // Delete a comment

router.put(":tenantId/:postId/:commentId", authMiddleware, commentController.updateComment); // Edit a comment

module.exports = router;
