const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // For sending emails
const Trainer = require("../models/Trainer");
const Admin = require("../models/Admin");
const adminAuthMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const secretKey = "admin@123"; // Enter a secure secret key

// Trainer Registration
router.post("/trainerRegistration", adminAuthMiddleware, async (req, res) => {
  try {
    // Extract required fields from request body
    const { name, email, phone, specialization, commissionRate, password } =
      req.body;

    // Check if all required fields are provided
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: "All details must be provided for registration" });
    }

    // Check if the provided email is already registered
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the initial password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Trainer document
    const newTrainer = new Trainer({
      name,
      email,
      phone,
      specialization,
      commissionRate,
      password: hashedPassword, // Store hashed password
      roles: ["trainer"], // By default, new trainers are assigned the role "trainer"
    });

    // Save the new trainer
    await newTrainer.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: newTrainer.email, role: newTrainer.roles },
      secretKey,
      { expiresIn: "2w" }
    );

    res.status(201).json({ message: "Trainer registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Registration

router.post("/adminRegistration", async (req, res) => {
  try {
    // Extract required fields from request body
    const { name, email, phone, specialization, commissionRate, password } =
      req.body;

    // Check if all required fields are provided
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: "All details must be provided for registration" });
    }

    // Check if the provided email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the initial password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Admin document
    const newAdmin = new Admin({
      name,
      email,
      phone,
      specialization,
      commissionRate,
      password: hashedPassword, // Store hashed password
    });

    // Save the new admin
    await newAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: newAdmin.email, role: newAdmin.roles },
      secretKey,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Admin registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trainer Login

// Trainer login route
router.post("/trainerLogin", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the trainer by email
    const trainer = await Trainer.findOne({ email });

    // If trainer not found, return error
    if (!trainer) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, trainer.password);

    // If passwords don't match, return error
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: trainer.email, role: trainer.roles },
      secretKey,
      { expiresIn: "2w" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// admin login

// Admin login route
router.post("/adminLogin", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the admin by email
    const admin = await Admin.findOne({ email });

    // If admin not found, return error
    if (!admin) {
      return res.status(401).json({ error: "Invalid email!" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password);

    // If passwords don't match, return error
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid Password!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: admin.email, role: admin.roles },
      secretKey,
      { expiresIn: "2d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// /register - This route is used to register new users. It accepts the user's name, email, phone number, and password. It then hashes the password and saves the user to the database.

router.post("/register", async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed." });
  }
});

// Example route that requires admin authentication
router.get("/protectedRoute", adminAuthMiddleware, (req, res) => {
  // Access admin object attached by the middleware
  const admin = req.admin;
  res.status(200).json({
    message: `Welcome, ${admin.name}! You have access to this protected route.`,
  });
});

// /forgot-password - This route is used to initiate the password reset process. It sends an OTP to the user's college email address. If the user exists in the database, it generates a new OTP, sends it via email, and updates the user's OTP field.

// Step 3: Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OTP sending failed." });
  }
});

// Step 4: Reset Password - Verify OTP and Update Password
router.post("/reset-password", async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Password reset failed." });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  // impleament on frontend

  res.json({ message: "Logout successful." });
});

module.exports = router;
