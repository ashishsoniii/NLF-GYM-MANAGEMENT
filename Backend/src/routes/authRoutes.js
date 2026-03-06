const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // For sending emails
const Trainer = require("../models/Trainer");
const Admin = require("../models/Admin");
const Member = require("../models/Member");
const adminAuthMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is required");
}

const requireSuperAdmin = (req, res, next) => {
  const roles = req.admin?.roles;
  if (!Array.isArray(roles) || !roles.includes("Super Admin")) {
    return res.status(403).json({ error: "Super Admin access required" });
  }
  next();
};

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

// List all admins (auth required, no passwords)
router.get("/admins", adminAuthMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 }).lean();
    res.status(200).json({ admins });
  } catch (error) {
    console.error("List admins error:", error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// Add super admin (auth required)
router.post("/admins", adminAuthMiddleware, async (req, res) => {
  try {
    const { name, email, phone, password, superAdmin } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Name, email, phone and password are required" });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const roles = superAdmin ? ["Admin", "Super Admin"] : ["Admin"];
    const newAdmin = new Admin({
      name,
      email,
      phone,
      password: hashedPassword,
      roles,
      specialization: superAdmin ? "Super Admin" : "Admin",
      commissionRate: 0,
    });
    await newAdmin.save();
    const admin = await Admin.findById(newAdmin._id).select("-password").lean();
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    console.error("Add admin error:", error);
    res.status(500).json({ error: error.message || "Failed to create admin" });
  }
});

// Update admin (super admin only)
router.patch("/admins/:id", adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, superAdmin } = req.body;
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    if (name !== undefined) admin.name = name;
    if (email !== undefined) admin.email = email.toLowerCase();
    if (phone !== undefined) admin.phone = phone;
    if (typeof superAdmin === "boolean") {
      admin.roles = superAdmin ? ["Admin", "Super Admin"] : ["Admin"];
      admin.specialization = superAdmin ? "Super Admin" : "Admin";
    }
    await admin.save();
    const updated = await Admin.findById(id).select("-password").lean();
    res.status(200).json({ message: "Admin updated", admin: updated });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ error: error.message || "Failed to update admin" });
  }
});

// Reset admin password (super admin only)
router.post("/admins/:id/reset-password", adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 1) {
      return res.status(400).json({ error: "newPassword is required" });
    }
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    admin.password = await bcrypt.hash(String(newPassword), 10);
    await admin.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: error.message || "Failed to reset password" });
  }
});

// Delete admin (super admin only)
router.delete("/admins/:id", adminAuthMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }
    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted" });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ error: error.message || "Failed to delete admin" });
  }
});

// get admin details
// Route to fetch user details based on token
router.get("/userDetails", async (req, res) => {
  try {
    // Extract token from headers or query parameters
    const token = req.headers.authorization; 

    // Verify token
    const decodedToken = jwt.verify(token, secretKey);

    // Extract email from decoded token
    const { email } = decodedToken;

    // Find user (either Trainer or Admin) by email and exclude password field
    let user = await Trainer.findOne({ email }).select("-password");

    if (!user) {
      user = await Admin.findOne({ email }).select("-password");
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user details
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
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


// change admin password

router.post("/changePassword",  async (req, res) => {
  try {
    const { userID, oldPassword, newPassword } = req.body;

    // Retrieve user from database
    const user = await Admin.findById(userID);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify old password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid old password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});


// GET /auth/email-type?email=... - Returns whether email is admin or member (for unified login)
router.get("/email-type", async (req, res) => {
  try {
    const email = (req.query.email || req.body?.email || "").toString().trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(200).json({ type: "admin" });
    }
    const member = await Member.findOne({ email });
    if (member) {
      return res.status(200).json({ type: "member" });
    }
    return res.status(404).json({ type: null, error: "No account found with this email." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
    const tokenPayload = {
      email: admin.email,
      name: admin.name,
      phone: admin.phone,
      role: admin.roles,
    };
    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "2d" });

    res
      .status(200)
      .json({ message: "Login successful", token, ...tokenPayload });
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
