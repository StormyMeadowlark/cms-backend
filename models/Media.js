const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "image/png", // Valid MIME type for PNG images
        "image/jpeg", // Valid MIME type for JPEG images
        "image/gif",  // Valid MIME type for GIF images
        "video/mp4",  // Valid MIME type for MP4 videos
        "video/avi",  // Valid MIME type for AVI videos
        "video/mpeg", // Valid MIME type for MPEG videos
        "application/pdf", // Valid MIME type for PDF documents
        "image/svg+xml",   // Valid MIME type for SVG images
        "Other",      // Custom type for other files
      ],
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", MediaSchema);
module.exports = Media;
