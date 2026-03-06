const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const { sendEmail, sendEmailwithAttachment } = require("./sendEmail");
const jsPDF = require("jspdf");
const Plan = require("../models/Plan");
const adminAuthMiddleware = require("../middleware/authMiddleware");
const memberAuthMiddleware = require("../middleware/memberAuthMiddleware");
const { newUser } = require("./emailTemplates/newUser");
const { invoiceHTML } = require("./emailTemplates/invoiceHTML");
const puppeteer = require("puppeteer");
const Email = require("../models/Email"); // Import the Email model
const sharp = require("sharp");
const multer = require("multer");
const upload = require("../middleware/multer");


/** @param category one of: 'broadcast' | 'otp' | 'welcome' | 'invoice' | 'custom' */
async function saveEmailRecord(userId, subject, emailContent, category = 'broadcast') {
  const emailRecord = new Email({
    nameTo: userId,
    subject,
    emailTo: emailContent,
    category,
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

    await saveEmailRecord(newMember.name, subject, email, 'welcome');

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

// Import from PHPMyAdmin JSON export. Auth required.
// POST /member/import-phpmyadmin  body: <raw array from u343517709_nlf.json> or { data: array }
// Parses users + address + plan + enrolls_to and creates one Member per user with payments from enrolls_to.
router.post("/import-phpmyadmin", adminAuthMiddleware, async (req, res) => {
  try {
    const raw = req.body;
    const arr = Array.isArray(raw) ? raw : (raw?.data ?? raw?.phpmyadmin ?? null);
    if (!Array.isArray(arr) || arr.length === 0) {
      return res.status(400).json({
        error: "Body must be the PHPMyAdmin JSON array or { data: [...] }",
      });
    }

    const tables = {};
    arr.forEach((item) => {
      if (item?.type === "table" && item?.name && Array.isArray(item.data)) {
        tables[item.name] = item.data;
      }
    });

    const users = tables.users || [];
    const addressList = tables.address || [];
    const planList = tables.plan || [];
    const enrollsTo = tables.enrolls_to || [];

    const addressById = new Map(addressList.map((a) => [String(a.id), a]));
    const planByPid = new Map(planList.map((p) => [String(p.pid), p]));

    const enrollmentsByUid = new Map();
    enrollsTo.forEach((e) => {
      const uid = String(e.uid);
      if (!enrollmentsByUid.has(uid)) enrollmentsByUid.set(uid, []);
      enrollmentsByUid.get(uid).push(e);
    });

    const plans = await Plan.find({ isActive: true }).lean();
    const planByName = new Map(plans.map((p) => [p.name.toLowerCase().trim(), p]));

    const toInsert = [];
    const errors = [];

    for (let i = 0; i < users.length; i += 1) {
      const u = users[i];
      const userid = String(u.userid);
      const name = u.username != null ? String(u.username).trim() : null;
      const email = u.email != null ? String(u.email).trim().toLowerCase() : null;
      const phone = (u.mobile != null ? String(u.mobile).trim() : null) || (u.contact != null ? String(u.contact).trim() : null);

      if (!name || !email || !phone) {
        errors.push({
          index: i + 1,
          identifier: email || name || userid,
          error: "Missing name, email or mobile",
        });
        continue;
      }

      const addr = addressById.get(userid);
      const addressStr = addr
        ? [addr.streetName, addr.city, addr.state, addr.zipcode].filter(Boolean).join(", ")
        : undefined;

      const enrollments = (enrollmentsByUid.get(userid) || [])
        .map((e) => ({
          ...e,
          paid_date: e.paid_date ? parseDate(e.paid_date) : null,
          expire: e.expire ? parseDate(e.expire) : null,
        }))
        .filter((e) => e.paid_date && e.expire)
        .sort((a, b) => (b.expire > a.expire ? 1 : -1));

      const latestEnroll = enrollments[0];
      if (!latestEnroll) {
        errors.push({
          index: i + 1,
          identifier: email,
          error: "No enrollment (paid_date/expire) found for user",
        });
        continue;
      }

      const planInfo = planByPid.get(String(latestEnroll.pid)) || {};
      const latestPlanName = planInfo.planName != null ? String(planInfo.planName).trim() : "Plan";
      const latestPaymentAmount = parseNumber(planInfo.amount) ?? 0;
      const joiningDate = parseDate(u.joining_date, latestEnroll.paid_date) || latestEnroll.paid_date;
      const expiryDate = latestEnroll.expire;
      const latestPaymentDate = latestEnroll.paid_date;

      const payments = enrollments.map((e) => {
        const p = planByPid.get(String(e.pid)) || {};
        return {
          amount: parseNumber(p.amount) ?? 0,
          date: e.paid_date,
          joiningDate: e.paid_date,
          expiryDate: e.expire,
          paymentMethod: "Cash",
          plan: {
            planId: null,
            name: p.planName || "Plan",
            duration: parseNumber(p.validity) ?? 1,
            price: parseNumber(p.amount) ?? 0,
          },
        };
      });

      let membershipPlanId = (planByName.get(latestPlanName.toLowerCase().trim()) || {})._id || null;

      const memberDoc = {
        name,
        email,
        phone,
        address: addressStr,
        dateOfBirth: parseDate(u.dob) || undefined,
        gender: ["Male", "Female", "Other"].includes(String(u.gender || "").trim()) ? String(u.gender).trim() : undefined,
        membershipPlan: membershipPlanId || undefined,
        joiningDate,
        expiryDate,
        latestPaymentDate,
        latestPaymentAmount,
        latestPlanName,
        payments,
        assignedTrainer: undefined,
        workoutType: "Fitness",
        isActive: true,
        notes: undefined,
      };

      toInsert.push(memberDoc);
    }

    if (toInsert.length === 0) {
      return res.status(400).json({
        message: "No valid members to insert",
        errors,
      });
    }

    let inserted = 0;
    let failedFromDb = [];
    try {
      const result = await Member.insertMany(toInsert, { ordered: false });
      inserted = Array.isArray(result) ? result.length : (result.insertedCount ?? 0);
    } catch (err) {
      inserted = err.insertedDocs?.length ?? err.result?.nInserted ?? 0;
      const writeErrors = err.writeErrors || [];
      failedFromDb = writeErrors.map((e) => ({
        index: e.index + 1,
        identifier: toInsert[e.index]?.email || `index ${e.index + 1}`,
        error: e.err?.message || e.err?.errmsg || String(e.err),
      }));
    }

    return res.status(201).json({
      message: `PHPMyAdmin import complete: ${inserted} members inserted, ${errors.length + failedFromDb.length} failed`,
      inserted,
      failed: errors.length + failedFromDb.length,
      errors: [...errors, ...failedFromDb],
    });
  } catch (error) {
    console.error("import-phpmyadmin error:", error);
    return res.status(500).json({ error: error.message || "Import failed" });
  }
});

// Bulk add members from JSON (e.g. phpMyAdmin export). Auth required.
// POST /member/bulk-add  body: { members: [ { name, email, phone, ... }, ... ] }
router.post("/bulk-add", adminAuthMiddleware, async (req, res) => {
  try {
    const { members: rawMembers } = req.body;

    if (!Array.isArray(rawMembers) || rawMembers.length === 0) {
      return res.status(400).json({
        error: "Body must be { members: [ {...}, {...} ] } with at least one member",
      });
    }

    const plans = await Plan.find({ isActive: true }).lean();
    const planByName = new Map(plans.map((p) => [p.name.toLowerCase().trim(), p]));

    const toInsert = [];
    const errors = [];

    for (let i = 0; i < rawMembers.length; i += 1) {
      const row = rawMembers[i];
      const name = row.name != null ? String(row.name).trim() : null;
      const email = row.email != null ? String(row.email).trim().toLowerCase() : null;
      const phone = row.phone != null ? String(row.phone).trim() : null;

      if (!name || !email || !phone) {
        errors.push({
          index: i + 1,
          identifier: email || name || `row ${i + 1}`,
          error: "Missing required field: name, email and phone are required",
        });
        continue;
      }

      const joiningDate = parseDate(row.joiningDate, new Date());
      const expiryDate = parseDate(row.expiryDate);
      const latestPaymentDate = parseDate(row.latestPaymentDate, new Date());
      if (!expiryDate) {
        errors.push({
          index: i + 1,
          identifier: email,
          error: "Valid expiryDate required (e.g. YYYY-MM-DD)",
        });
        continue;
      }

      const latestPaymentAmount = parseNumber(row.latestPaymentAmount, row.latest_payment_amount);
      const latestPlanName = row.latestPlanName != null ? String(row.latestPlanName).trim() : (row.latest_plan_name != null ? String(row.latest_plan_name).trim() : null);
      if (latestPaymentAmount == null || latestPaymentAmount < 0) {
        errors.push({
          index: i + 1,
          identifier: email,
          error: "Valid latestPaymentAmount (number >= 0) required",
        });
        continue;
      }
      if (!latestPlanName) {
        errors.push({
          index: i + 1,
          identifier: email,
          error: "latestPlanName (or latest_plan_name) required",
        });
        continue;
      }

      let membershipPlanId = null;
      if (row.membershipPlan) {
        membershipPlanId = mongoose.Types.ObjectId.isValid(row.membershipPlan)
          ? row.membershipPlan
          : (planByName.get(String(row.membershipPlan).toLowerCase().trim()) || {})._id;
      }
      if (!membershipPlanId && latestPlanName) {
        const plan = planByName.get(latestPlanName.toLowerCase().trim());
        if (plan) membershipPlanId = plan._id;
      }

      const gender = row.gender != null ? String(row.gender).trim() : null;
      const validGender = gender && ["Male", "Female", "Other"].includes(gender) ? gender : undefined;

      const workoutType = row.workoutType != null ? String(row.workoutType).trim() : (row.workout_type != null ? String(row.workout_type).trim() : null);
      const validWorkout = workoutType && ["Fitness", "Weight Lifting", "Cardio", "Yoga", "General"].includes(workoutType) ? workoutType : "Fitness";

      let payments = [];
      if (Array.isArray(row.payments) && row.payments.length > 0) {
        payments = row.payments.map((p) => ({
          amount: parseNumber(p.amount) ?? 0,
          date: parseDate(p.date, new Date()),
          joiningDate: parseDate(p.joiningDate, joiningDate),
          expiryDate: parseDate(p.expiryDate, expiryDate),
          paymentMethod: ["Cash", "Card", "Online"].includes(p.paymentMethod || p.payment_method) ? (p.paymentMethod || p.payment_method) : "Cash",
          plan: {
            planId: p.planId || p.plan_id || membershipPlanId,
            name: p.name || latestPlanName,
            duration: typeof p.duration === "number" ? p.duration : parseNumber(p.duration),
            price: typeof p.price === "number" ? p.price : parseNumber(p.price),
          },
        })).filter((p) => p.amount >= 0);
      }
      if (payments.length === 0) {
        payments = [
          {
            amount: latestPaymentAmount,
            date: latestPaymentDate,
            joiningDate,
            expiryDate,
            paymentMethod: "Cash",
            plan: {
              planId: membershipPlanId,
              name: latestPlanName,
              duration: null,
              price: latestPaymentAmount,
            },
          },
        ];
      }

      const memberDoc = {
        name,
        email,
        phone,
        address: row.address != null ? String(row.address).trim() : undefined,
        dateOfBirth: row.dateOfBirth != null ? parseDate(row.dateOfBirth) : undefined,
        gender: validGender,
        membershipPlan: membershipPlanId || undefined,
        joiningDate,
        expiryDate,
        latestPaymentDate,
        latestPaymentAmount,
        latestPlanName,
        payments,
        assignedTrainer: row.assignedTrainer && mongoose.Types.ObjectId.isValid(row.assignedTrainer) ? row.assignedTrainer : undefined,
        workoutType: validWorkout,
        isActive: row.isActive !== false && row.is_active !== false,
        notes: row.notes != null ? String(row.notes).trim() : undefined,
      };

      toInsert.push(memberDoc);
    }

    if (toInsert.length === 0) {
      return res.status(400).json({
        message: "No valid members to insert",
        errors,
      });
    }

    let inserted = 0;
    let failedFromDb = [];

    try {
      const result = await Member.insertMany(toInsert, { ordered: false });
      inserted = Array.isArray(result) ? result.length : (result.insertedCount ?? 0);
    } catch (err) {
      inserted = err.insertedDocs?.length ?? err.result?.nInserted ?? 0;
      const writeErrors = err.writeErrors || [];
      failedFromDb = writeErrors.map((e) => ({
        index: e.index + 1,
        identifier: toInsert[e.index]?.email || `index ${e.index + 1}`,
        error: e.err?.message || e.err?.errmsg || String(e.err),
      }));
    }

    return res.status(201).json({
      message: `Bulk add complete: ${inserted} inserted, ${errors.length + failedFromDb.length} failed`,
      inserted,
      failed: errors.length + failedFromDb.length,
      errors: [...errors, ...failedFromDb],
    });
  } catch (error) {
    console.error("Bulk add error:", error);
    return res.status(500).json({ error: error.message || "Bulk add failed" });
  }
});

function parseDate(val, fallback = null) {
  if (val == null) return fallback;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function parseNumber(val, alt) {
  if (val != null && !Number.isNaN(Number(val))) return Number(val);
  if (alt != null && !Number.isNaN(Number(alt))) return Number(alt);
  return null;
}

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

router.post("/addPayment/:id", adminAuthMiddleware, async (req, res) => {
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
      await saveEmailRecord(member.name, subject, member.email, 'invoice');
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

// Route to get expired users for a specified number of days or all expired users (auth required)
router.get("/expiredUser/:days", adminAuthMiddleware, async (req, res) => {
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
    const { category } = req.query;
    const filter = {};
    if (category && ['broadcast', 'otp', 'welcome', 'invoice', 'custom'].includes(category)) {
      if (category === 'broadcast') {
        filter.$or = [{ category: 'broadcast' }, { category: { $exists: false } }];
      } else {
        filter.category = category;
      }
    }
    const emails = await Email.find(filter).sort({ sentAt: -1 });

    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ---------- Member portal (customer-facing) ----------

// Self-registration (no auth)
router.post("/self-register", async (req, res) => {
  try {
    const { name, email, phone, address, dateOfBirth, gender, workoutType, emergencyContact } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email and phone are required" });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await Member.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "You are already registered. Please login." });
    }
    const now = new Date();
    const newMember = new Member({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      address: address ? String(address).trim() : undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      workoutType: workoutType || "Fitness",
      emergencyContact: emergencyContact ? String(emergencyContact).trim() : undefined,
      joiningDate: now,
      expiryDate: now,
      latestPaymentDate: now,
      latestPaymentAmount: 0,
      latestPlanName: "No Plan",
      payments: [],
      isActive: true,
    });
    await newMember.save();
    res.status(201).json({
      message: "Registration successful. Please login with your email using OTP.",
      memberId: newMember._id,
    });
  } catch (error) {
    console.error("Self-register error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Current member profile (member auth)
router.get("/me", memberAuthMiddleware, async (req, res) => {
  try {
    const member = req.member;
    const obj = member.toObject();
    delete obj.profileImage;
    delete obj.__v;
    res.status(200).json(obj);
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

const MEMBER_EDITABLE_FIELDS = ["address", "dateOfBirth", "gender", "workoutType", "emergencyContact", "notes"];

router.patch("/me", memberAuthMiddleware, async (req, res) => {
  try {
    const updates = {};
    for (const key of MEMBER_EDITABLE_FIELDS) {
      if (req.body[key] !== undefined) {
        if (key === "dateOfBirth") {
          updates[key] = req.body[key] ? new Date(req.body[key]) : null;
        } else {
          updates[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
        }
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No allowed fields to update" });
    }
    const member = await Member.findByIdAndUpdate(
      req.member._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    const obj = member.toObject();
    delete obj.profileImage;
    delete obj.__v;
    res.status(200).json(obj);
  } catch (error) {
    console.error("PATCH /me error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/me/payments", memberAuthMiddleware, async (req, res) => {
  try {
    const payments = (req.member.payments || []).map((p) => ({
      amount: p.amount,
      date: p.date,
      joiningDate: p.joiningDate,
      expiryDate: p.expiryDate,
      paymentMethod: p.paymentMethod,
      plan: p.plan,
    }));
    res.status(200).json({ payments });
  } catch (error) {
    console.error("GET /me/payments error:", error);
    res.status(500).json({ error: "Failed to load payments" });
  }
});

// Razorpay: create order (member auth)
router.post("/payment/create-order", memberAuthMiddleware, async (req, res) => {
  try {
    const Razorpay = require("razorpay");
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ error: "Invalid or inactive plan" });
    }
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(503).json({ error: "Payment is not configured" });
    }
    const amountPaise = Math.round(plan.price * 100);
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    // Razorpay receipt max 40 chars
    const receipt = `m${req.member._id.toString().slice(-8)}p${planId.toString().slice(-8)}${Date.now().toString().slice(-8)}`;
    const order = await instance.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
    });
    res.status(200).json({
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      razorpayKey: keyId,
      plan: { _id: plan._id, name: plan.name, duration: plan.duration, price: plan.price },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Razorpay: verify payment and update member
router.post("/payment/verify", memberAuthMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ error: "Missing payment details" });
    }
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({ error: "Payment is not configured" });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ error: "Invalid plan" });
    }
    const member = req.member;
    const now = new Date();
    const joiningDate = member.expiryDate && member.expiryDate > now ? member.expiryDate : now;
    const expiryDate = new Date(joiningDate);
    expiryDate.setMonth(expiryDate.getMonth() + plan.duration);
    const paymentEntry = {
      amount: plan.price,
      date: now,
      joiningDate,
      expiryDate,
      paymentMethod: "Online",
      plan: {
        planId: plan._id,
        name: plan.name,
        duration: plan.duration,
        price: plan.price,
      },
    };
    const updatedPayments = [...(member.payments || []), paymentEntry];
    await Member.findByIdAndUpdate(member._id, {
      $set: {
        payments: updatedPayments,
        membershipPlan: plan._id,
        expiryDate,
        latestPaymentDate: now,
        latestPaymentAmount: plan.price,
        latestPlanName: plan.name,
      },
    });
    const updated = await Member.findById(member._id);
    const obj = updated.toObject();
    delete obj.profileImage;
    delete obj.__v;
    res.status(200).json({ message: "Payment successful", member: obj });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ error: "Payment verification failed" });
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
    await saveEmailRecord(
      emailOption === 'everyone' ? 'everyone' : 'custom',
      subject,
      emailsToSend.join(', '),
      emailOption === 'everyone' ? 'broadcast' : 'custom'
    );
    
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
