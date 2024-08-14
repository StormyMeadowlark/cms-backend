// models/Settings.js
const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "My CMS" },
    siteUrl: { type: String, default: "http://localhost" },
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },
    maintenanceMode: { type: Boolean, default: false },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    logo: { type: String }, // URL to the logo image
    favicon: { type: String }, // URL to the favicon image
    registrationEnabled: { type: Boolean, default: true },
    passwordStrength: { type: String, default: "medium" },
    emailVerification: { type: Boolean, default: false },
    seoDefaults: {
      metaTitle: { type: String, default: "My CMS" },
      metaDescription: { type: String, default: "Default description" },
      metaKeywords: [String],
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
    security: {
      ipWhitelist: [String],
      loginAttemptsLimit: { type: Number, default: 5 },
    },
    integrations: {
      googleAnalytics: { type: String }, // Google Analytics tracking ID
      socialMedia: {
        facebook: { type: String },
        twitter: { type: String },
      },
    },
    backups: {
      autoBackupEnabled: { type: Boolean, default: true },
      backupFrequency: { type: String, default: "daily" },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", SettingsSchema);
module.exports = Settings;
