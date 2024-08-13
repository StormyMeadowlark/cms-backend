// routes/socialMediaRoutes.js

const express = require("express");
const router = express.Router();
const socialMediaController = require("../controllers/socialMediaController");
const authMiddleware = require("../middleware/authMiddleware");

// Social Media Management
router.post("/", authMiddleware.verifyAdmin, socialMediaController.createPost); // Create a new social media post
router.put(
  "/:id",
  authMiddleware.verifyAdmin,
  socialMediaController.updatePost
); // Update a social media post
router.post(
  "/schedule/:id",
  authMiddleware.verifyAdmin,
  socialMediaController.schedulePost
); // Schedule a social media post
router.post(
  "/publish/:id",
  authMiddleware.verifyAdmin,
  socialMediaController.publishPost
); // Publish a social media post immediately

module.exports = router;
