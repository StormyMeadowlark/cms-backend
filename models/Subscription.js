// models/Subscription.js

const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId, // Store tenant ID as ObjectId
      required: true,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
module.exports = Subscription;
