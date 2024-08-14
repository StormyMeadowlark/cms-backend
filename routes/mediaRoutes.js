// routes/mediaRoutes.js

const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware")

// Protected routes (Admin and Admin)
router.post(
  "/upload",
  authMiddleware.verifyAdmin,
  upload.single('file'), // Use the Multer middleware here
  mediaController.uploadMedia
);
router.get("/", authMiddleware.verifyAdmin, mediaController.getAllMedia); // Get all media
router.get("/:id", authMiddleware.verifyAdmin, mediaController.getMediaById); // Get media by ID
router.delete("/:id", authMiddleware.verifyAdmin, mediaController.deleteMedia); // Delete media

module.exports = router;
