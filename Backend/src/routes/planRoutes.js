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

// Bulk add plans by name, duration, price. Auth required.
// POST /plan/bulk-add  body: { plans: [ { name, duration, price, description?, isActive? }, ... ] }
router.post("/bulk-add", adminAuthMiddleware, async (req, res) => {
  try {
    const { plans: rawPlans } = req.body;
    if (!Array.isArray(rawPlans) || rawPlans.length === 0) {
      return res.status(400).json({
        error: "Body must be { plans: [ { name, duration, price }, ... ] } with at least one plan",
      });
    }

    const existing = await Plan.find().select("name").lean();
    const existingNames = new Set(existing.map((p) => p.name.toLowerCase().trim()));

    const toInsert = [];
    const skipped = [];
    const errors = [];

    for (let i = 0; i < rawPlans.length; i += 1) {
      const p = rawPlans[i];
      const name = p.name != null ? String(p.name).trim() : null;
      const duration = parseNumber(p.duration);
      const price = parseNumber(p.price);

      if (!name) {
        errors.push({ index: i + 1, error: "Missing plan name" });
        continue;
      }
      if (duration == null || duration < 1) {
        errors.push({ index: i + 1, name, error: "duration must be a number >= 1" });
        continue;
      }
      if (price == null || price < 0) {
        errors.push({ index: i + 1, name, error: "price must be a number >= 0" });
        continue;
      }

      const key = name.toLowerCase();
      if (existingNames.has(key)) {
        skipped.push({ index: i + 1, name });
        continue;
      }

      existingNames.add(key);
      toInsert.push({
        name,
        duration,
        price,
        description: p.description != null ? String(p.description).trim() : undefined,
        isActive: p.isActive !== false,
      });
    }

    if (toInsert.length === 0) {
      return res.status(400).json({
        message: "No new plans to insert (all skipped or invalid)",
        skipped: skipped.length,
        errors,
      });
    }

    const created = await Plan.insertMany(toInsert);
    return res.status(201).json({
      message: `${created.length} plan(s) created, ${skipped.length} skipped (duplicate name), ${errors.length} invalid`,
      inserted: created.length,
      skipped: skipped.length,
      errors,
      plans: created,
    });
  } catch (error) {
    console.error("Plan bulk-add error:", error);
    return res.status(500).json({ error: error.message || "Bulk add failed" });
  }
});

// Import plans from PHPMyAdmin JSON. Auth required.
// POST /plan/import-phpmyadmin  body: <raw PHPMyAdmin array> or { data: array }
// Extracts "plan" table: planName->name, validity->duration, amount->price, active->isActive
router.post("/import-phpmyadmin", adminAuthMiddleware, async (req, res) => {
  try {
    const raw = req.body;
    const arr = Array.isArray(raw) ? raw : raw?.data ?? null;
    if (!Array.isArray(arr) || arr.length === 0) {
      return res.status(400).json({
        error: "Body must be the PHPMyAdmin JSON array or { data: [...] }",
      });
    }

    const table = arr.find((item) => item?.type === "table" && item?.name === "plan");
    const planRows = table?.data || [];

    if (planRows.length === 0) {
      return res.status(400).json({ error: "No 'plan' table found in the JSON" });
    }

    const existing = await Plan.find().select("name").lean();
    const existingNames = new Set(existing.map((p) => p.name.toLowerCase().trim()));

    const toInsert = [];
    const skipped = [];

    for (let i = 0; i < planRows.length; i += 1) {
      const p = planRows[i];
      const name = (p.planName != null ? String(p.planName).trim() : null) || (p.plan_name != null ? String(p.plan_name).trim() : null);
      const duration = parseNumber(p.validity) ?? 1;
      const price = parseNumber(p.amount) ?? 0;
      const description = p.description != null ? String(p.description).trim() : undefined;
      const isActive = String(p.active || "").toLowerCase() === "yes";

      if (!name) continue;

      const key = name.toLowerCase();
      if (existingNames.has(key)) {
        skipped.push({ name });
        continue;
      }

      existingNames.add(key);
      toInsert.push({
        name,
        duration: Math.max(1, duration),
        price: Math.max(0, price),
        description,
        isActive,
      });
    }

    if (toInsert.length === 0) {
      return res.status(400).json({
        message: "No new plans to insert (all already exist or invalid)",
        skipped: skipped.length,
      });
    }

    const created = await Plan.insertMany(toInsert);
    return res.status(201).json({
      message: `${created.length} plan(s) imported from PHPMyAdmin, ${skipped.length} skipped (duplicate name)`,
      inserted: created.length,
      skipped: skipped.length,
      plans: created,
    });
  } catch (error) {
    console.error("Plan import-phpmyadmin error:", error);
    return res.status(500).json({ error: error.message || "Import failed" });
  }
});

function parseNumber(val) {
  if (val == null) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

// Get all plans (auth required)
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get currently ACTIVE plans (auth required)
router.get("/active", adminAuthMiddleware, async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List active plans (no auth – for member portal)
router.get("/list-active", async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).select("name duration price description");
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific plan by ID (auth required)
router.get("/:id", adminAuthMiddleware, async (req, res) => {
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
