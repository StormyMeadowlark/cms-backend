// routes/newsletterRoutes.js

const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const authMiddleware = require("../middleware/authMiddleware");

// Newsletter Management
//create newsletter
router.post(
  "/",
  authMiddleware.verifyAdmin,
  newsletterController.createNewsletter
); 

//get newsletter by id
router.get(
  "/:id",
  authMiddleware.verifyAdmin,
  newsletterController.getNewsletterById
);

//update newsletter
router.put(
  "/:id",
  authMiddleware.verifyAdmin,
  newsletterController.updateNewsletter
);
//schedule newsletter
router.post(
  "/schedule/:id",
  authMiddleware.verifyAdmin,
  newsletterController.scheduleNewsletter
); 
//send a newsletter
router.post(
  "/send/:id",
  authMiddleware.verifyAdmin,
  newsletterController.sendNewsletter
); // Send a newsletter immediately

// Subscription Management
router.post("/subscribe", newsletterController.subscribe); // Subscribe to newsletters
router.get("/unsubscribe", newsletterController.unsubscribe); // Unsubscribe from newsletters
router.get(
  "/subscribers",
  authMiddleware.verifyAdmin,
  newsletterController.getAllSubscribers
);
module.exports = router;
