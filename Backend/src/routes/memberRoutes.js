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
const Email = require("../models/Email"); // Import the Email model
const sharp = require("sharp");
const upload = require("../middleware/multer");


async function saveEmailRecord(userId, subject, emailContent) {
  const emailRecord = new Email({
    nameTo: userId,
    subject: subject,
    emailTo: emailContent,
  });
  await emailRecord.save();
}

async function generatePDFfromHTML(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true, // Set to true to run in headless mode (no browser window)
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

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  } else if (error) {
    return res.status(500).json({ error: "An error occurred while uploading the image." });
  }
  next();
});



// Route to add a new member by an admin
// Route to add a new member by an admin
router.post("/add", adminAuthMiddleware, upload.single("profileImage"), async (req, res) => {
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

    // Check if an image was uploaded
    let profileImage = null;
    if (req.file) {
      console.log("Image uploaded");
      profileImage = await sharp(req.file.buffer)
        .resize({ width: 200, height: 200 }) 
        .png()
        .toBuffer();
    }

    let parsedPayments = [];
    if (payments) {
      try {
        parsedPayments = JSON.parse(payments);
        if (!Array.isArray(parsedPayments)) {
          throw new Error("Payments should be an array");
        }
      } catch (error) {
        console.error("Invalid payments data format", error);
        return res.status(400).json({ error: "Invalid payments data format" });
      }
    }

    // Create and save the new member
    const newMember = new Member({
      name,
      profileImage,
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
      payments: parsedPayments,
      assignedTrainer,
      workoutType,
      isActive,
      notes,
    });

    const savedMember = await newMember.save();

    // Prepare email content
    const subject = "Welcome to the Gym!";
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

    let pdfBuffer;
    try {
      // Generate PDF invoice from HTML
      pdfBuffer = await generatePDFfromHTML(invoicehtml);
    } catch (error) {
      console.error("Error generating PDF, skipping email attachment:", error);
    }

    // If PDF is generated, send it as an attachment; otherwise, send a basic email
    let emailSent;
    if (pdfBuffer) {
      emailSent = await sendEmailwithAttachment(email, subject, html, {
        filename: "invoice.pdf",
        content: pdfBuffer,
      });
    } else {
      emailSent = await sendEmail(email, subject, html);
    }

    if (!emailSent) {
      console.log("Failed to send email but member added successfully.");
      return res.status(201).json({
        message: "Member added successfully, but there was an error sending the email.",
        member: savedMember,
      });
    }

    await saveEmailRecord(newMember.name, subject, email);

    res.status(201).json({
      message: "Member added and email sent successfully",
      member: savedMember,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `Duplicate key error: The ${duplicateKey} '${error.keyValue[duplicateKey]}' is already in use.`,
      });
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

    try {
      // Generate PDF and send email
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
        console.log("Failed to send email, but proceeding without error.");
      } else {
        console.log("Email sent successfully.");
      }

      // Save email record only if email was sent
      await saveEmailRecord(member.name, subject, member.email);
    } catch (emailError) {
      console.error("Error during email processing:", emailError);
      // Continue with the process even if email fails
    }

    // Send success response to the client regardless of email status
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

// gets all sent emails!
router.get("/emails", adminAuthMiddleware, async (req, res) => {
  try {
    // Fetch all emails sorted by sentAt in descending order
    const emails = await Email.find().sort({ sentAt: -1 });

    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Route to send emails to users - everyone & custom
router.post("/sendEmail", adminAuthMiddleware, async (req, res) => {
  const { emailOption, customEmails, subject, content } = req.body;

  try {
    let emailsToSend = [];

    if (emailOption === 'everyone') {
      // Fetch all members' emails
      const members = await Member.find({}, 'email');
      console.log(members);
      emailsToSend = members.map(member => member.email);
      console.log(emailsToSend);
    } else if (emailOption === 'custom') {
      // Use custom emails
      emailsToSend = customEmails.split(',').map(email => email.trim());
    }

    if (emailsToSend.length === 0) {
      return res.status(400).json({ error: "No emails to send" });
    }

    // Send emails
    for (const email of emailsToSend) {
      await sendEmail(email, subject, content);
    }
    await saveEmailRecord(emailOption === 'everyone' ? 'everyone' : 'custom', subject, emailsToSend.join(', '));
    
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
