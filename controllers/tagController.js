// controllers/tagController.js
const Tag = require("../models/Tag");
const mongoose = require("mongoose");

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log("Tag data:", { name, description }); // Debugging line

    const tag = new Tag({ name, description });
    await tag.save();

    res.status(201).json(tag);
  } catch (error) {
    console.error("Error creating tag:", error); // Debugging line
    res.status(500).json({ error: "Error creating tag" });
  }
};

// Get all tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tags" });
  }
};

// Update a tag
exports.updateTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    const tag = await Tag.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ error: "Error updating tag" });
  }
};

// Delete a tag
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid tag ID" });
    }

    const result = await Tag.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);

    // Specific error handling for certain cases
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid tag ID format" });
    }

    // Fallback for any other error
    res.status(500).json({ error: "Internal server error" });
  }
};