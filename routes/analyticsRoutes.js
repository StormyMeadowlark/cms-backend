// routes/analyticsRoutes.js

const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (Admin and Editor)
router.get(
  "/",
  authMiddleware.verifyAdmin,
  analyticsController.getAllAnalytics
); // Get all analytics data
router.get(
  "/post/:postId",
  authMiddleware.verifyAdmin,
  analyticsController.getAnalyticsByPost
); // Get analytics data for a specific post

module.exports = router;
