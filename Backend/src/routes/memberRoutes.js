const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const { sendEmail, sendEmailwithAttachment } = require("./sendEmail");
const jsPDF = require("jspdf");
const Plan = require("../models/Plan");
const adminAuthMiddleware = require("../middleware/authMiddleware");
const { newUser } = require("./emailTemplates/newUser");
const { invoiceHTML } = require("./emailTemplates/invoiceHTML");
const puppeteer = require("puppeteer");

async function generatePDFfromHTML(htmlContent) {
  const browser = await puppeteer.launch({
    headless: false, // Keep headless false as per your requirement
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    timeout: 60000, // Increase timeout to 60 seconds
  });

  const page = await browser.newPage();
  try {
    await page.setContent(htmlContent, { waitUntil: "networkidle0" }); // Wait until network is idle
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    await browser.close();
    throw error;
  }
}

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
      duration,
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
    // Send the email

    const html = newUser({
      name,
      email,
      phone,
      latestPlanName,
      latestPaymentAmount,
      joiningDate,
      expiryDate,
    });
    const invoicehtml = invoiceHTML({
      name,
      email,
      phone,
      latestPlanName,
      latestPaymentDate,
      duration,
      latestPaymentAmount,
      joiningDate,
      expiryDate,
    });

    const pdfBuffer = await generatePDFfromHTML(invoicehtml);

    // const emailSent = await sendEmail(email, subject, html);

    const emailSent = await sendEmailwithAttachment(email, subject, html, {
      filename: "invoice.pdf",
      content: pdfBuffer,
    });

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

    // Prepare email content
    const subject = "Payment Confirmation";
    const invoicehtml = invoiceHTML({
      name: member.name,
      email: member.email,
      phone: member.phone,
      latestPlanName: plan.name,
      latestPaymentDate: newPayment.date,
      duration: plan.duration,
      latestPaymentAmount: amount,
      joiningDate,
      expiryDate,
    });

    console.log(member);
    const html = newUser({
      name: member.name,
      email: member.email,
      phone: member.phone,
      latestPlanName: plan.name,
      latestPaymentAmount: amount,
      joiningDate,
      expiryDate,
    });

    const pdfBuffer = await generatePDFfromHTML(invoicehtml);

    const emailSent = await sendEmailwithAttachment(
      member.email,
      subject,
      html,
      {
        filename: "invoice.pdf",
        content: pdfBuffer,
      }
    );

    if (!emailSent) {
      console.log("Failed to send email");
      return res.status(500).json({ error: "Failed to send email" });
    } else {
      console.log("Email send");
    }

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
