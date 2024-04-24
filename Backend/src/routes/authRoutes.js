const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // For sending emails
const User = require("../models/Trainer");

const router = express.Router();
const secretKey = "admin@123"; // Enter a secure secret key

// Step 1: User Registration

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

// /forgot-password - This route is used to initiate the password reset process. It sends an OTP to the user's college email address. If the user exists in the database, it generates a new OTP, sends it via email, and updates the user's OTP field.

// Step 3: Forgot Password - Send OTP to College Email
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
