// routes/mediaRoutes.js

const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const upload = require("../middleware/uploadMiddleware")
const authMiddleware = require("../middleware/authMiddleware");
// Protected routes (Admin and Admin)
router.post(
  "/upload", authMiddleware,
  upload.single("file"), // Use the Multer middleware here
  mediaController.uploadMedia
);
router.get(
  "/",
  authMiddleware,
  mediaController.getAllMedia
); // Get all media
router.get(
  "/:id",
  authMiddleware,
  mediaController.getMediaById
); // Get media by ID
router.delete("/:id", authMiddleware, mediaController.deleteMedia); // Delete media

module.exports = router;
