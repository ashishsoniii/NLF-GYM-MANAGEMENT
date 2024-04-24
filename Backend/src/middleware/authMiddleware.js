// Create a middleware function to authenticate requests using the JWT token. This middleware can be applied to routes that require authentication:

// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const secretKey = "admin@123"; // Replace with the same secret key used for signing

function authenticateToken(req, res, next) {
	const token = req.header("Authorization");
	console.log(token);
	if (!token)
		return res.status(401).json({ error: "Authentication required." });

	jwt.verify(token, secretKey, (err, user) => {
		if (err) return res.status(403).json({ error: "Invalid token." });
		req.user = user;
		next();
	});
}

module.exports = authenticateToken;
