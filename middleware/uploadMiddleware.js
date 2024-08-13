const multer = require("multer");

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory as Buffer objects

// Set up the file filter to accept only certain file types, e.g., images and videos
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

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // Limit file size to 10MB
  },
});

module.exports = upload;
