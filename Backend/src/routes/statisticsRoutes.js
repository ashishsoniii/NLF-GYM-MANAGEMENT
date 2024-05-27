const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const Plan = require("../models/Plan");
const adminAuthMiddleware = require("../middleware/authMiddleware");


// Route to get the required statistics
router.get('/statistics', async (req, res) => {
    try {
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const nextMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  
      // Current month income
      const incomeResult = await Member.aggregate([
        { $unwind: '$payments' },
        { $match: { 'payments.date': { $gte: currentMonthStart, $lt: nextMonthStart } } },
        { $group: { _id: null, totalIncome: { $sum: '$payments.amount' } } },
      ]);
  
      const currentMonthIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;
  
      // Count all active members
      const activeMembersCount = await Member.countDocuments({ isActive: true });
  
      // Members who joined this month
      const joinedThisMonthCount = await Member.countDocuments({ joiningDate: { $gte: currentMonthStart, $lt: nextMonthStart } });
  
      // Total number of plans
      const totalPlansCount = await Plan.countDocuments();
  
      res.json({
        currentMonthIncome,
        activeMembersCount,
        joinedThisMonthCount,
        totalPlansCount,
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching statistics' });
    }
  });
  
  module.exports = router;
