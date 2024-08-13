// routes/newsletterRoutes.js

const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const authMiddleware = require("../middleware/authMiddleware");

// Newsletter Management
router.post(
  "/",
  authMiddleware.verifyAdmin,
  newsletterController.createNewsletter
); // Create a new newsletter
router.put(
  "/:id",
  authMiddleware.verifyAdmin,
  newsletterController.updateNewsletter
); // Update a newsletter
router.post(
  "/schedule/:id",
  authMiddleware.verifyAdmin,
  newsletterController.scheduleNewsletter
); // Schedule a newsletter
router.post(
  "/send/:id",
  authMiddleware.verifyAdmin,
  newsletterController.sendNewsletter
); // Send a newsletter immediately

// Subscription Management
router.post("/subscribe", newsletterController.subscribe); // Subscribe to newsletters
router.post("/unsubscribe", newsletterController.unsubscribe); // Unsubscribe from newsletters

module.exports = router;
