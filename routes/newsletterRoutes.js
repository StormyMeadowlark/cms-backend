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
  scheduleNewsletter,
  getAllSubscribers,
  getSubscriberById,
} = require("../controllers/newsletterController");
const authMiddleware = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

// Corrected routes with added functionality
router.get(
  "/:tenantId/subscribers",
  tenantMiddleware,
  authMiddleware,
  getAllSubscribers
);
router.get(
  "/:tenantId/subscribers/:subscriberId",
  tenantMiddleware,
  authMiddleware,
  getSubscriberById
);

router.post("/:tenantId", authMiddleware, tenantMiddleware, createNewsletter);
router.put(
  "/:tenantId/:id",
  authMiddleware,
  tenantMiddleware,
  updateNewsletter
);
router.delete(
  "/:tenantId/:id",
  authMiddleware,
  tenantMiddleware,
  deleteNewsletter
);

router.get("/:tenantId", authMiddleware, tenantMiddleware, getAllNewsletters);
router.get(
  "/:tenantId/:id",
  authMiddleware,
  tenantMiddleware,
  getNewsletterById
);

router.post("/:tenantId/subscribe", tenantMiddleware, subscribe);
router.post("/:tenantId/unsubscribe", tenantMiddleware, unsubscribe);
router.post(
  "/:tenantId/:id/send",
  authMiddleware,
  tenantMiddleware,
  sendNewsletter
);

// Add missing route for scheduling a newsletter
router.post(
  "/:tenantId/:id/schedule",
  authMiddleware,
  tenantMiddleware,
  scheduleNewsletter
);

module.exports = router;
