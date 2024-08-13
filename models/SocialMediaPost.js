// models/SocialMediaPost.js

const mongoose = require("mongoose");

const SocialMediaPostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ["Facebook", "Twitter", "LinkedIn", "Instagram", "Pinterest", "YouTube"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Published"],
      default: "Draft",
    },
    publishDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SocialMediaPost = mongoose.model(
  "SocialMediaPost",
  SocialMediaPostSchema
);
module.exports = SocialMediaPost;
