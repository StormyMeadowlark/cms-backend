const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

// Route to record a view for a specific post
router.post(
  "/record/:postId",
  authMiddleware.verifyUser, // Assuming any logged-in user can trigger a view
  analyticsController.recordView
);

// Route to get analytics data for a specific post
router.get(
  "/post/:postId",
  authMiddleware.verifyAdmin, // Admins only
  analyticsController.getAnalyticsByPost
);

// Route to get all analytics data
router.get(
  "/",
  authMiddleware.verifyAdmin, // Admins only
  analyticsController.getAllAnalytics
);

module.exports = router;
