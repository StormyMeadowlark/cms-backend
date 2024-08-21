// routes/tagRoutes.js

const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", tagController.getAllTags); // Get all tags

// Protected routes (Admin and Admin)
router.post("/", authMiddleware, tagController.createTag); // Create a new tag
router.put("/:id", authMiddleware, tagController.updateTag); // Update a tag
router.delete("/:id", authMiddleware, tagController.deleteTag); // Delete a tag

module.exports = router;
