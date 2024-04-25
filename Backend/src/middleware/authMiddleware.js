// Create a middleware function to authenticate requests using the JWT token. This middleware can be applied to routes that require authentication:

// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const secretKey = "admin@123"; // Replace with the same secret key used for signing

const Admin = require("../models/Admin");

const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Extract token from the request headers
    const token = req.headers.authorization;

    // If token is not provided, return unauthorized status
    if (!token) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    // Verify token
    const decoded = jwt.verify(token, secretKey);

    // Check if the decoded token contains a valid email and role
    if (!decoded.email || !decoded.role || !decoded.role.includes("Admin")) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if the admin exists
    const admin = await Admin.findOne({ email: decoded.email });
    if (!admin) {
      return res.status(401).json({ error: "Admin not found" });
    }

    // Attach the admin object to the request for further use in routes
    req.admin = admin;

    // Move to the next middleware
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = adminAuthMiddleware;
