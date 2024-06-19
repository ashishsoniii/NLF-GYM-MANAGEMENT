const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const Plan = require("../models/Plan");
const adminAuthMiddleware = require("../middleware/authMiddleware");

// Route to get the required statistics
router.get("/statistics", async (req, res) => {
  try {
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const nextMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1
    );

    // Current month income
    const incomeResult = await Member.aggregate([
      { $unwind: "$payments" },
      {
        $match: {
          "payments.date": { $gte: currentMonthStart, $lt: nextMonthStart },
        },
      },
      { $group: { _id: null, totalIncome: { $sum: "$payments.amount" } } },
    ]);

    const currentMonthIncome =
      incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;

    // Count all active members
    const activeMembersCount = await Member.countDocuments({ isActive: true });

    // Members who joined this month
    const joinedThisMonthCount = await Member.countDocuments({
      joiningDate: { $gte: currentMonthStart, $lt: nextMonthStart },
    });

    // Total number of plans
    const totalPlansCount = await Plan.countDocuments();

    res.json({
      currentMonthIncome,
      activeMembersCount,
      joinedThisMonthCount,
      totalPlansCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching statistics" });
  }
});

// get me list of ppl month wise
router.get("/members/joined", async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).send("Month and year are required.");
  }

  const startDate = new Date(year, month - 1, 1); // month is zero-indexed
  const endDate = new Date(year, month, 1); // start of the next month

  try {
    const members = await Member.find({
      joiningDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const memberCount = members.length;

    res.json({
      count: memberCount,
      members,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});



// Route to get chart data
// router.get("/members/chart-data", async (req, res) => {
//   try {
//     // Aggregate data to get counts per month
//     const data = await Member.aggregate([
//       {
//         $group: {
//           _id: {
//             month: { $month: "$joiningDate" },
//             year: { $year: "$joiningDate" },
//           },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $sort: {
//           "_id.year": 1,
//           "_id.month": 1,
//         },
//       },
//     ]);

//     // Process data to match the required chart structure
//     const labels = [];
//     const series = [
//       {
//         name: 'Joined Members',
//         type: 'column',
//         fill: 'solid',
//         data: [],
//       },
//     ];

//     data.forEach((item) => {
//       labels.push(`${item._id.month}/01/${item._id.year}`);
//       series[0].data.push(item.count);
//     });

//     res.json({
//       labels,
//       series,
//     });
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });


router.get("/members/chart-data", async (req, res) => {
  try {
    // Aggregate data to get counts and other details per month
    const joinData = await Member.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$joiningDate" },
            year: { $year: "$joiningDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const paymentData = await Member.aggregate([
      { $unwind: "$payments" },
      {
        $group: {
          _id: {
            month: { $month: "$payments.date" },
            year: { $year: "$payments.date" },
          },
          totalPayment: { $sum: "$payments.amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const totalPayments = await Member.aggregate([
      { $unwind: "$payments" },
      {
        $group: {
          _id: null,
          totalPayment: { $sum: "$payments.amount" },
        },
      },
    ]);

    // Process data to match the required chart structure
    const labels = [];
    const series = [
      {
        name: 'Joined Members',
        type: 'column',
        fill: 'solid',
        data: [],
      },
      {
        name: 'Payments Added This Month',
        type: 'area',
        fill: 'gradient',
        data: [],
      },
      {
        name: 'Total Payments',
        type: 'line',
        fill: 'solid',
        data: [],
      },
    ];

    const totalPaymentMap = new Map();
    paymentData.forEach((item) => {
      const dateKey = `${item._id.year}-${item._id.month}`;
      totalPaymentMap.set(dateKey, item.totalPayment);
    });

    let cumulativeTotalPayments = 0;
    joinData.forEach((item) => {
      const dateKey = `${item._id.year}-${item._id.month}`;
      labels.push(`${item._id.month}/01/${item._id.year}`);
      series[0].data.push(item.count);
      const monthlyPayment = totalPaymentMap.get(dateKey) || 0;
      series[1].data.push(monthlyPayment);
      cumulativeTotalPayments += monthlyPayment;
      series[2].data.push(cumulativeTotalPayments);
    });

    res.json({
      labels,
      series,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});



module.exports = router;
