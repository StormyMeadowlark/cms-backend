// routes/likeRoutes.js

const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const authMiddleware = require("../middleware/authMiddleware");

// Like a post
router.post(
  "/like/:postId",
  authMiddleware.verifyUser,
  likeController.likePost
);

// Dislike a post
router.post(
  "/dislike/:postId",
  authMiddleware.verifyUser,
  likeController.dislikePost
);

module.exports = router;
