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
    // Aggregate data to get counts and other details per month for joining dates
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

    // Aggregate data to get counts of payments per month
    const paymentData = await Member.aggregate([
      { $unwind: "$payments" },
      {
        $group: {
          _id: {
            month: { $month: "$payments.date" },
            year: { $year: "$payments.date" },
          },
          count: { $sum: 1 }, // Count the number of payments
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Aggregate data to get the cumulative total payments
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

    const paymentCountMap = new Map();
    paymentData.forEach((item) => {
      const dateKey = `${item._id.year}-${item._id.month}`;
      paymentCountMap.set(dateKey, item.count);
    });

    let cumulativeTotalPayments = 0;
    joinData.forEach((item) => {
      const dateKey = `${item._id.year}-${item._id.month}`;
      labels.push(`${item._id.month}/01/${item._id.year}`);
      series[0].data.push(item.count);
      const monthlyPaymentCount = paymentCountMap.get(dateKey) || 0;
      series[1].data.push(monthlyPaymentCount);
      cumulativeTotalPayments += monthlyPaymentCount;
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


// Route to get MLE (Male/Female/Other) statistics
router.get('/members/mle-statistics', async (req, res) => {
  try {
    const mleStatistics = await Member.aggregate([
      {
        $group: {
          _id: '$gender', // Group by gender field
          count: { $sum: 1 }, // Count number of members in each gender category
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the output
          gender: '$_id', // Rename _id field to gender
          count: 1, // Include count field in the output
        },
      },
    ]);

    // Prepare data in the required format for the frontend
    const formattedData = mleStatistics.map((stat) => ({
      label: stat.gender,
      value: stat.count,
    }));

    res.json({
      series: formattedData,
    });
  } catch (error) {
    console.error('Error fetching MLE statistics:', error);
    res.status(500).json({ error: 'Failed to fetch MLE statistics' });
  }
});



module.exports = router;
