// models/Post.js

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    // Other fields...
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
    tenantId: { type:mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] },
    publishStatus: {
      type: String,
      enum: ["Draft", "Scheduled", "Published"],
      default: "Draft",
    },
    publishDate: { type: Date },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of users who liked the post
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of users who disliked the post
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
