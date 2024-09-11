const EmailTemplate = require("../models/EmailTemplate");

// Create a new email template
exports.createTemplate = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { templateType, title, subject, htmlContent } = req.body;

    const newTemplate = new EmailTemplate({
      tenantId,
      templateType,
      title,
      subject,
      htmlContent,
    });

    await newTemplate.save();
    res
      .status(201)
      .json({ message: "Template created successfully.", newTemplate });
  } catch (error) {
    console.error("Error creating email template:", error.message);
    res.status(500).json({ error: "Error creating email template." });
  }
};

// Get all email templates for a tenant
exports.getAllTemplates = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const templates = await EmailTemplate.find({ tenantId });
    res.status(200).json(templates);
  } catch (error) {
    console.error("Error fetching email templates:", error.message);
    res.status(500).json({ error: "Error fetching email templates." });
  }
};

// Get a specific email template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const { tenantId, templateId } = req.params;
    const template = await EmailTemplate.findOne({ _id: templateId, tenantId });
    if (!template) {
      return res.status(404).json({ error: "Template not found." });
    }
    res.status(200).json(template);
  } catch (error) {
    console.error("Error fetching email template:", error.message);
    res.status(500).json({ error: "Error fetching email template." });
  }
};

// Update an email template
exports.updateTemplate = async (req, res) => {
  try {
    const { tenantId, templateId } = req.params;
    const { templateType, title, subject, htmlContent } = req.body;

    const updatedTemplate = await EmailTemplate.findOneAndUpdate(
      { _id: templateId, tenantId },
      { templateType, title, subject, htmlContent, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ error: "Template not found." });
    }

    res
      .status(200)
      .json({ message: "Template updated successfully.", updatedTemplate });
  } catch (error) {
    console.error("Error updating email template:", error.message);
    res.status(500).json({ error: "Error updating email template." });
  }
};

// Delete an email template
exports.deleteTemplate = async (req, res) => {
  try {
    const { tenantId, templateId } = req.params;
    const deletedTemplate = await EmailTemplate.findOneAndDelete({
      _id: templateId,
      tenantId,
    });

    if (!deletedTemplate) {
      return res.status(404).json({ error: "Template not found." });
    }

    res.status(200).json({ message: "Template deleted successfully." });
  } catch (error) {
    console.error("Error deleting email template:", error.message);
    res.status(500).json({ error: "Error deleting email template." });
  }
};
