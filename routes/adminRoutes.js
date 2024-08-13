// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const settingsController = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin Dashboard
router.get(
  "/dashboard",
  authMiddleware.verifyAdmin,
  adminController.getDashboardData
); // Get data for admin dashboard

// Settings Management (Admin-only)
router.get(
  "/settings",
  authMiddleware.verifyAdmin,
  settingsController.getSettings
); // Get all settings
router.put(
  "/settings",
  authMiddleware.verifyAdmin,
  settingsController.updateSettings
); // Update settings

module.exports = router;
