// models/Settings.js

const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "My CMS",
    },
    adminEmail: {
      type: String,
      default: "admin@mysite.com",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    apiKeys: {
      googleAnalytics: { type: String },
      mailchimp: { type: String },
    },
    customCSS: {
      type: String,
      default: "",
    },
    // Add other settings fields as needed
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", SettingsSchema);
module.exports = Settings;
