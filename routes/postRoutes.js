// routes/postRoutes.js

const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", postController.getAllPosts); // Get all posts (published only)
router.get("/:id", postController.getPostById); // Get post by ID (published only)

// Protected routes (Admin and Editor)
router.post("/", authMiddleware.verifyAdmin, postController.createPost); // Create a new post
router.put("/:id", authMiddleware.verifyEditor, postController.updatePost); // Update a post
router.delete("/:id", authMiddleware.verifyEditor, postController.deletePost); // Delete a post

// Publishing controls
router.post(
  "/:id/publish",
  authMiddleware.verifyEditor,
  postController.publishPost
); // Publish a post
router.post(
  "/:id/unpublish",
  authMiddleware.verifyEditor,
  postController.unpublishPost
); // Unpublish a post

router.post(
  "/:postId/like",
  authMiddleware.verifyUser,
  postController.likePost
);
router.post(
  "/:postId/dislike",
  authMiddleware.verifyUser,
  postController.dislikePost
);

module.exports = router;
