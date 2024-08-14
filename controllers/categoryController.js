// controllers/categoryController.js

const Category = require("../models/Category");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log("Creating category with data:", { name, description });

    const category = new Category({ name, description });
    await category.save();

    console.log("Category created successfully:", category);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error creating category" });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log("Fetching all categories...");
    const categories = await Category.find();
    console.log("Categories fetched:", categories.length, "categories found.");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Error fetching categories" });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching category with ID:", id);

    const category = await Category.findById(id);

    if (!category) {
      console.log("Category not found for ID:", id);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("Category fetched successfully:", category);
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Error fetching category" });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    console.log("Updating category with ID:", id, "with data:", {
      name,
      description,
    });

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!category) {
      console.log("Category not found for ID:", id);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("Category updated successfully:", category);
    res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Error updating category" });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting category with ID:", id);

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      console.log("Category not found for ID:", id);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("Category deleted successfully:", category);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Error deleting category" });
  }
};
