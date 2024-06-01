const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const { sendEmail } = require("./sendEmail");
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

    // Prepare email content
    const subject = "Welcome to the Gym!";
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333333;
      }
      p {
        color: #666666;
      }
    </style>
    </head>
    <body>
      <div class="container">
        <h1>Payment Confirmation</h1>
        <p>Hi <strong> ${name} </strong>,</p>
        <p>Thank you for your payment! Here are the details:</p>
        <ul>
          <li><strong>Name:</strong>  ${name} </li>
          <li><strong>Email:</strong> ${email} </li>
          <li><strong>Phone Number:</strong>  ${phone}</li>
          <li><strong>Plan Name:</strong> ${latestPlanName} </li>
          <li><strong>Payment Amount:</strong> ${latestPaymentAmount} Rs.</li>
          <li><strong>Start Date:</strong>  ${joiningDate}</li>
          <li><strong>End Date:</strong>  ${expiryDate} </li>
          <li><strong>Validity:</strong>  ${"validityP"} Months</li>
        </ul>
        <p>Your invoice is attached to this email!</p>
    
        <p>Thank you for choosing No Limits Fitness. You are now part of our fitness community!</p>
        <p>We are excited to help you achieve your health and fitness goals. Our team will review your goals and create a personalized plan that suits your needs.</p>
        <p>If you have any questions or need assistance, please feel free to reach out to us at <strong>9982482431</strong>.</p>
        <p>Congratulations on taking the step towards a healthier you. We are proud to be part of your fitness journey!</p>
        <p>We look forward to witnessing your progress and success!</p>
        <p><strong>Mahendra Yadav</strong><br>(Your Fitness Coach)</p>
      </div>
    </body>
    </html>
        
    
    `;
    // Send the email
    const emailSent = await sendEmail(email, subject, html);

    if (!emailSent) {
      console.log("Failed to send email & adding user");
      return res
        .status(500)
        .json({ error: "Failed to send email & adding user" });
    }

    const savedMember = await newMember.save();
    res
      .status(201)
      .json({ message: "Member added successfully", member: savedMember });
  } catch (error) {
    console.error("Error adding member:", error);

    if (error.name === "ValidationError") {
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

// router.get("/expiredUser", async (req, res) => {
//   try {
//     // Get the current date
//     const currentDate = new Date();

//     // Query for members whose expiryDate is less than or equal to the current date
//     const members = await Member.find({ expiryDate: { $lte: currentDate } });

//     // Send the expired members as the response
//     res.status(200).json({ members });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });

// Route to get expired users for a specified number of days or all expired users
router.get("/expiredUser/:days", async (req, res) => {
  try {
    // Get the number of days from the route parameters
    const daysParam = req.params.days;

    // Get the current date
    const currentDate = new Date();

    // Initialize the query object
    let query = {};

    // Check if days parameter is a valid number or 'all'
    if (daysParam === "all") {
      // If 'all', get all expired members (expiryDate <= currentDate)
      query = { expiryDate: { $lte: currentDate } };
    } else {
      const days = parseInt(daysParam, 10);

      // Validate the days parameter
      if (![7, 14, 31].includes(days)) {
        return res
          .status(400)
          .send("Invalid number of days. Please use 7, 14, 31, or 'all'.");
      }

      // Calculate the target date
      const targetDate = new Date();
      targetDate.setDate(currentDate.getDate() - days);

      // Set the query to find members with expiryDate in the specified range
      query = { expiryDate: { $gte: targetDate, $lte: currentDate } };
    }

    // Query for members based on the constructed query object
    const members = await Member.find(query);

    // Send the expired members as the response
    res.status(200).json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
