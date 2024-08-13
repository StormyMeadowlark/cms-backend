// routes/categoryRoutes.js

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", categoryController.getAllCategories); // Get all categories

// Protected routes (Admin and Editor)
router.post(
  "/",
  authMiddleware.verifyEditor,
  categoryController.createCategory
); // Create a new category
router.put(
  "/:id",
  authMiddleware.verifyEditor,
  categoryController.updateCategory
); // Update a category
router.delete(
  "/:id",
  authMiddleware.verifyEditor,
  categoryController.deleteCategory
); // Delete a category

module.exports = router;
