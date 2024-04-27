const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const adminAuthMiddleware = require('../middleware/authMiddleware');

// Route to add a new member by an admin
router.post('/add', adminAuthMiddleware, async (req, res) => {
    try {
      // Extract member data from request body
      const {
        name,
        email,
        phone,
        address,
        membershipPlan,
        joiningDate,
        expiryDate,
        latestPaymentDate,
        payments,
        assignedTrainer,
        workoutType,
        isActive,
        notes
      } = req.body;
  
      // Create a new member object
      const newMember = new Member({
        name,
        email,
        phone,
        address,
        membershipPlan,
        joiningDate,
        expiryDate,
        latestPaymentDate,
        payments,
        assignedTrainer,
        workoutType,
        isActive,
        notes
      });
  
      // Save the new member to the database
      const savedMember = await newMember.save();
  
      res.status(201).json({ message: 'Member added successfully', member: savedMember });
    } catch (error) {
      console.error('Error adding member:', error);
  
      if (error.name === 'ValidationError') {
        // If the error is a validation error, extract the error messages
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ error: errors.join(', ') });
      }
  
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
module.exports = router;
