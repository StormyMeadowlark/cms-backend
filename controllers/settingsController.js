// controllers/settingsController.js
const Settings = require("../models/Settings");

// Get the current settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne(); // Assuming you have only one settings document
    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Error fetching settings" });
  }
};

// Update the settings
exports.updateSettings = async (req, res) => {
  try {
    const updatedSettings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true, // Create a new document if none exists
    });

    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Error updating settings" });
  }
};
