const mongoose = require("mongoose");

const EmailTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Tenant", // Reference to the Tenant model in the User Management API
    },
    templateType: {
      type: String,
      required: true,
      enum: [
        "welcome",
        "subscribe",
        "unsubscribe",
        "password-reset-request",
        "password-reset-confirmation",
        "account-verification",
        "promotional",
        "event-invitation",
        "deactivation-warning",
        "account-deactivated",
        "digest",
        "feedback-request",
        "order-confirmation",
        "shipping-notification",
        "email-verification",
        "digital-purchase",
        "thank-you",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const EmailTemplate = mongoose.model("EmailTemplate", EmailTemplateSchema);

module.exports = EmailTemplate;
