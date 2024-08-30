const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes for handling media
router.post("/upload", upload.single("file"), (req, res) => {
  console.log("Received file upload in cms-backend:", req.file);
  if (!req.file) {
    console.error("File not received or incorrectly parsed.");
    return res.status(400).send("No file uploaded.");
  }
  mediaController.uploadMedia(req, res);
}); // Ensure the file field name is "file"
router.get("/", mediaController.getAllMedia); // Get all media
router.get("/:id", mediaController.getMediaById); // Get media by ID
router.delete("/:id", mediaController.deleteMedia); // Delete media

module.exports = router;
