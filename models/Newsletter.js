// models/Newsletter.js

const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }],
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Sent"],
      default: "Draft",
    },
    sendDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Newsletter = mongoose.model("Newsletter", NewsletterSchema);
module.exports = Newsletter;
