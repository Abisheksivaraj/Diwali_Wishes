const express = require("express");
const router = express.Router();
const Signature = require("../Models/Signature");

// GET all signatures
router.get("/", async (req, res) => {
  try {
    const signatures = await Signature.find().sort({ updatedAt: -1 });
    res.json({ signatures });
  } catch (error) {
    console.error("Error fetching signatures:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET single signature by ID
router.get("/:id", async (req, res) => {
  try {
    const signature = await Signature.findById(req.params.id);
    if (!signature) {
      return res.status(404).json({ error: "Signature not found" });
    }
    res.json({ signature });
  } catch (error) {
    console.error("Error fetching signature:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new signature
router.post("/", async (req, res) => {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        error: "Missing required fields: name, content",
      });
    }

    const newSignature = new Signature({
      name,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newSignature.save();

    console.log(`✅ Signature created: ${name}`);
    res.status(201).json({ signature: newSignature });
  } catch (error) {
    console.error("Error creating signature:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update signature
router.put("/:id", async (req, res) => {
  try {
    const { name, content } = req.body;

    const updatedSignature = await Signature.findByIdAndUpdate(
      req.params.id,
      {
        name,
        content,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedSignature) {
      return res.status(404).json({ error: "Signature not found" });
    }

    console.log(`✅ Signature updated: ${name}`);
    res.json({ signature: updatedSignature });
  } catch (error) {
    console.error("Error updating signature:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE signature
router.delete("/:id", async (req, res) => {
  try {
    const deletedSignature = await Signature.findByIdAndDelete(req.params.id);

    if (!deletedSignature) {
      return res.status(404).json({ error: "Signature not found" });
    }

    console.log(`✅ Signature deleted: ${deletedSignature.name}`);
    res.json({
      success: true,
      message: "Signature deleted successfully",
      signature: deletedSignature,
    });
  } catch (error) {
    console.error("Error deleting signature:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
