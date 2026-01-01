const express = require("express");
const router = express.Router();
const Template = require("../Models/Template");

// Get all templates
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single template
router.get("/:id", async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template not found" });
    }
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new template
router.post("/", async (req, res) => {
  try {
    const { name, subject, body } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, subject, and body",
      });
    }

    const template = new Template({
      name,
      subject,
      body,
    });

    await template.save();
    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update template
router.put("/:id", async (req, res) => {
  try {
    const { name, subject, body } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template not found" });
    }

    if (name) template.name = name;
    if (subject) template.subject = subject;
    if (body) template.body = body;
    template.updatedAt = Date.now();

    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete template
router.delete("/:id", async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template not found" });
    }
    res.json({ success: true, message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
