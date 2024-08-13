// controllers/tagController.js

const Tag = require("../models/Tag");

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;

    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({ error: "Tag already exists" });
    }

    const tag = new Tag({ name });
    await tag.save();

    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: "Error creating tag" });
  }
};

// Get all tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 }); // Sort alphabetically by name
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tags" });
  }
};

// Update a tag
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const tag = await Tag.findByIdAndUpdate(id, { name }, { new: true });

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

    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting tag" });
  }
};
