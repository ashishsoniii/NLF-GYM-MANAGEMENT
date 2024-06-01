const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const Plan = require("../models/Plan");
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
      latestPaymentAmount,
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
      latestPaymentAmount,
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

router.post("/addPayment/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, planId, expiryDate, joiningDate } = req.body;

  try {
    // Find the member by ID
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Find the plan by ID
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Calculate the expiry date based on the plan duration

    // Create the new payment object
    const newPayment = {
      amount,
      date: new Date(),
      joiningDate,
      expiryDate,
      paymentMethod: "Cash",
      plan: {
        planId: plan._id,
        name: plan.name,
        duration: plan.duration,
        price: plan.price,
      },
    };

    // Add the new payment to the member's payments array
    member.payments.push(newPayment);

    // Update the member's latest payment date and expiry date
    member.latestPaymentDate = joiningDate;
    member.expiryDate = expiryDate;
    member.membershipPlan = plan._id;
    member.latestPlanName = plan.name;

    // Save the updated member
    await member.save();

    res.status(200).json({ message: "Payment added successfully", member });
  } catch (error) {
    console.error("Error adding payment:", error);
    res
      .status(500)
      .json({ message: "An error occurred while adding payment", error });
  }
});

// expired user route

router.get("/expiredUser", async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();

    // Query for members whose expiryDate is less than or equal to the current date
    const members = await Member.find({ expiryDate: { $lte: currentDate } });

    // Send the expired members as the response
    res.status(200).json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// // Route to fetch all members
// router.get("/all", adminAuthMiddleware, async (req, res) => {
//   try {
//     const members = await Member.find();
//     res.status(200).json({ members });
//   } catch (error) {
//     console.error("Error fetching members:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

module.exports = router;
