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
      enum: ["Image", "Video", "Document", "Other"],
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
