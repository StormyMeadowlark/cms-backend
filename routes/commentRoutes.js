// routes/commentRoutes.js

const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post(
  "/:postId",
  authMiddleware.verifyUser,
  commentController.createComment
); // Add a new comment to a post
router.get("/:postId", commentController.getCommentsByPost); // Get all comments for a post

// Protected routes (for admin or the author of the comment)
router.delete(
  "/:id",
  authMiddleware.verifyUser,
  commentController.deleteComment
); // Delete a comment
router.put("/:id", authMiddleware.verifyUser, commentController.updateComment); // Edit a comment

module.exports = router;
