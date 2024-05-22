const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const adminAuthMiddleware = require("../middleware/authMiddleware");

// Route to add a new member by an admin
router.post("/add", adminAuthMiddleware, async (req, res) => {
  try {
    // Extract member data from request body
    const {
      name,
      email,
      phone,
      address,
      membershipPlan,
      dateOfBirth,
      gender,
      joiningDate,
      expiryDate,
      latestPaymentDate,
      latestPlanName,
      payments,
      assignedTrainer,
      workoutType,
      isActive,
      notes,
    } = req.body;

    // Create a new member object
    const newMember = new Member({
      name,
      email,
      phone,
      address,
      membershipPlan,
      dateOfBirth,
      gender,
      joiningDate,
      expiryDate,
      latestPlanName,
      latestPaymentDate,
      payments,
      assignedTrainer,
      workoutType,
      isActive,
      notes,
    });

    // Save the new member to the database
    const savedMember = await newMember.save();

    res
      .status(201)
      .json({ message: "Member added successfully", member: savedMember });
  } catch (error) {
    console.error("Error adding member:", error);

    if (error.name === "ValidationError") {
      // If the error is a validation error, extract the error messages
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to fetch all members
router.get("/all", adminAuthMiddleware, async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to activate a member
router.patch("/activate/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.status(200).json({ message: "Member activated successfully", member });
  } catch (error) {
    console.error("Error activating member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to deactivate a member
router.patch("/deactivate/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res
      .status(200)
      .json({ message: "Member deactivated successfully", member });
  } catch (error) {
    console.error("Error deactivating member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to delete a member
router.delete("/delete/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to modify a member's details
router.put("/modify/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMember) {
      return res.status(404).json({ error: "Member not found" });
    }
    res
      .status(200)
      .json({ message: "Member updated successfully", member: updatedMember });
  } catch (error) {
    console.error("Error updating member:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
