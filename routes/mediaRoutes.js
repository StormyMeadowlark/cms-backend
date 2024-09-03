const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const upload = require("../middleware/uploadMiddleware"); // Middleware for handling file uploads
const authMiddleware = require("../middleware/authMiddleware"); // Middleware for authentication

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Route to upload media
router.post("/upload", upload.single("file"), (req, res) => {
  console.log("Received file upload in cms-backend:", req.file);
  if (!req.file) {
    console.error("File not received or incorrectly parsed.");
    return res.status(400).send("No file uploaded.");
  }
  mediaController.uploadMedia(req, res);
});

// Route to get all media files
router.get("/", mediaController.getAllMedia);

// Route to update image metadata (like size)
router.put("/update", authMiddleware, mediaController.updateMediaMetadata);

// Route to get all media files by tenant
router.get("/tenant/:tenantId", mediaController.getMediaByTenant);

// Route to get a specific media file by ID
router.get("/:id", mediaController.getMediaById);

// Route to delete a media file by ID
router.delete("/:id", mediaController.deleteMedia);

module.exports = router;
