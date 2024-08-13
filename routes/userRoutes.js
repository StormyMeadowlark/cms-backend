// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", userController.registerUser); // Register a new user
router.post("/login", userController.loginUser); // Login a user


// Save and unsave posts
router.post('/save/:postId', authMiddleware.verifyUser, userController.savePost);
router.delete('/unsave/:postId', authMiddleware.verifyUser, userController.unsavePost);
router.get('/saved-posts', authMiddleware.verifyUser, userController.getSavedPosts);



// Protected routes (Admin-only)
router.get("/", authMiddleware.verifyAdmin, userController.getAllUsers); // Get all users
router.get("/:id", authMiddleware.verifyAdmin, userController.getUserById); // Get user by ID
router.put("/:id", authMiddleware.verifyAdmin, userController.updateUser); // Update user details
router.delete("/:id", authMiddleware.verifyAdmin, userController.deleteUser); // Delete a user

module.exports = router;
