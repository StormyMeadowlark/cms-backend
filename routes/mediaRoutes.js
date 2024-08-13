// routes/mediaRoutes.js

const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (Admin and Editor)
router.post(
  "/upload",
  authMiddleware.verifyEditor,
  mediaController.uploadMedia
); // Upload media
router.get("/", authMiddleware.verifyEditor, mediaController.getAllMedia); // Get all media
router.get("/:id", authMiddleware.verifyEditor, mediaController.getMediaById); // Get media by ID
router.delete("/:id", authMiddleware.verifyEditor, mediaController.deleteMedia); // Delete media

module.exports = router;
