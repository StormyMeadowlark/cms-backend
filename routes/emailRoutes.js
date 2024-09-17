const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const { submitContactForm } = require("../controllers/contactController"); 

// Apply tenant middleware to all routes
router.use("/:tenantId/*", tenantMiddleware);

// Create a new email template
router.post("/:tenantId/templates", emailController.createTemplate);

// Get all email templates for a tenant
router.get("/:tenantId/templates", emailController.getAllTemplates);

// Get a specific email template by ID
router.get("/:tenantId/:templateId/templates", emailController.getTemplateById);

// Update an email template
router.put("/:tenantId/:templateId/templates", emailController.updateTemplate);

// Delete an email template
router.delete(
  "/:tenantId/:templateId/templates",
  emailController.deleteTemplate
);

router.post("/:tenantId/contact", tenantMiddleware, submitContactForm);

module.exports = router;
