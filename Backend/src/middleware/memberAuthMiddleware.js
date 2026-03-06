const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is required');
}

const memberAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    const decoded = jwt.verify(token, secretKey);
    if (!decoded.memberId || decoded.role !== 'member') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const member = await Member.findById(decoded.memberId);
    if (!member) {
      return res.status(401).json({ error: 'Member not found' });
    }

    req.member = member;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = memberAuthMiddleware;
