const express = require("express");
const router = express.Router();
const {
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  getAllNewsletters,
  getNewsletterById,
  subscribe,
  unsubscribe,
  sendNewsletter,
  getAllSubscribers,
  getSubscriberById,
} = require("../controllers/newsletterController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new newsletter
router.post("/newsletters", authMiddleware, createNewsletter);

// Update an existing newsletter
router.put("/newsletters/:id", authMiddleware, updateNewsletter);

// Delete a newsletter
router.delete("/newsletters/:id", authMiddleware, deleteNewsletter);

// Get all newsletters
router.get("/newsletters", authMiddleware, getAllNewsletters);

// Get a newsletter by ID
router.get("/newsletters/:id", authMiddleware, getNewsletterById);

// Subscribe to a newsletter
router.post("/subscribe", authMiddleware, subscribe);

// Unsubscribe from a newsletter
router.post("/unsubscribe", authMiddleware, unsubscribe);

// Send a newsletter
router.post("/:id/send", authMiddleware, sendNewsletter);

module.exports = router;
