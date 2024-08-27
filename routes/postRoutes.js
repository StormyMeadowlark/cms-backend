const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");



// Public routes
router.get("/:tenantId", postController.getAllPosts);
router.get("/:tenantId/:postId", postController.getPostById);

// Protected routes
router.post("/:tenantId", authMiddleware, postController.createPost);
router.put("/:tenantId/:id", authMiddleware, postController.updatePost);
router.delete("/:tenantId/:id", authMiddleware, postController.deletePost);

// Publishing controls
router.post(
  "/:tenantId/:id/publish",
  authMiddleware,
  postController.publishPost
);
router.post(
  "/:tenantId/:id/unpublish",
  authMiddleware,
  postController.unpublishPost
);

// Like/Dislike controls
router.post("/:tenantId/:postId/like", authMiddleware, postController.likePost);
router.post(
  "/:tenantId/:postId/dislike",
  authMiddleware,
  postController.dislikePost
);

module.exports = router;
