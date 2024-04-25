const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const adminAuthMiddleware = require("../middleware/authMiddleware");

// Create a new plan
router.post("/", adminAuthMiddleware, async (req, res) => {
  try {
    const { name, duration, price, description, isActive } = req.body;
    // Check if a plan with the same name already exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res
        .status(400)
        .json({ error: "A plan with the same name already exists" });
    }

    const newPlan = await Plan.create({
      name,
      duration,
      price,
      description,
      isActive,
    });
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific plan by ID
router.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a plan
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { name, duration, price, description, isActive } = req.body;
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { name, duration, price, description, isActive },
      { new: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a plan
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate a plan
router.patch("/:id/activate", adminAuthMiddleware, async (req, res) => {
  try {
    const activatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!activatedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json(activatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate a plan
router.patch("/:id/deactivate", adminAuthMiddleware, async (req, res) => {
  try {
    const deactivatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!deactivatedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json(deactivatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
