const multer = require("multer");

// Configure storage
const storage = multer.memoryStorage(); // Store files in memory as Buffer objects

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error("Invalid file type. Only images and videos are allowed."),
      false
    ); // Reject the file
  }
};

// Initialize multer with storage, file filter, and limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Set limit to 50MB
});

module.exports = upload;
