const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Mapping of old SQL plan IDs to actual plan names and amounts
const PLAN_MAPPING = {
  'AMUWXD': { name: 'Yearly', amount: 10000 },
  'AOXKRB': { name: '1 MONTH', amount: 1500 },
  'CKSFLV': { name: '1 months', amount: 2600 },
  'DLWXTK': { name: '1 months  (cardio)', amount: 1300 },
  'DMACSJ': { name: '4 months', amount: 3500 },
  'FTJOHB': { name: 'Couple 6 month', amount: 15000 },
  'HXZYFR': { name: '3 MONTH (Special)', amount: 3500 },
  'IFCBOL': { name: '3 months  couple', amount: 7400 },
  'IGJXNZ': { name: '1 Couple', amount: 3000 },
  'KDLZAB': { name: 'Couple 1 month', amount: 2800 },
  'KMBEPW': { name: '3 MONTH', amount: 4000 },
  'LWOYAG': { name: 'yearly', amount: 14000 },
  'OKEFXM': { name: '8 months', amount: 8000 },
  'OUFJBT': { name: '1 months', amount: 2600 },
  'QYCJUB': { name: '5 month', amount: 5000 },
  'QYKCSO': { name: 'temp', amount: 4000 },
  'RKPLSM': { name: '2', amount: 3000 },
  'RMKXNL': { name: '6 MONTH (Special)', amount: 5000 },
  'ULPKHX': { name: 'Couple year', amount: 18000 },
  'YCNTQX': { name: '6 months', amount: 7000 }
};

async function login() {
  console.log('Logging in...');
  const response = await axios.post(`${API_BASE_URL}/auth/adminLogin`, {
    email: 'mahendra@nlf.com',
    password: 'admin'
  });
  return response.data.token;
}

async function fixMemberPlanData(token) {
  console.log('Fetching all members...');
  const response = await axios.get(`${API_BASE_URL}/member/all`, {
    headers: { Authorization: token }
  });

  const members = response.data.members || [];
  console.log(`Found ${members.length} members to update`);

  let updatedCount = 0;
  let unchangedCount = 0;

  for (const member of members) {
    let needsUpdate = false;
    const updates = {};

    // Check if latestPlanName is an old SQL plan ID
    if (member.latestPlanName && PLAN_MAPPING[member.latestPlanName]) {
      const planInfo = PLAN_MAPPING[member.latestPlanName];
      updates.latestPlanName = planInfo.name;
      updates.latestPaymentAmount = planInfo.amount;
      needsUpdate = true;
    }

    // Update payment history
    if (member.payments && member.payments.length > 0) {
      const updatedPayments = member.payments.map(payment => {
        // Check if plan.name is an old SQL plan ID
        if (payment.plan && payment.plan.name && PLAN_MAPPING[payment.plan.name]) {
          const planInfo = PLAN_MAPPING[payment.plan.name];
          return {
            ...payment,
            amount: planInfo.amount,
            plan: {
              ...payment.plan,
              name: planInfo.name,
              price: planInfo.amount
            }
          };
        }
        return payment;
      });

      // Check if payments actually changed
      const paymentsChanged = JSON.stringify(member.payments) !== JSON.stringify(updatedPayments);
      if (paymentsChanged) {
        updates.payments = updatedPayments;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      try {
        await axios.put(
          `${API_BASE_URL}/member/modify/${member._id}`,
          updates,
          { headers: { Authorization: token } }
        );
        updatedCount++;
        console.log(`✓ Updated ${member.name} - Plan: ${updates.latestPlanName || 'unchanged'}, Amount: ${updates.latestPaymentAmount || 'unchanged'}`);
      } catch (error) {
        console.error(`✗ Failed to update ${member.name}:`, error.response?.data || error.message);
      }
    } else {
      unchangedCount++;
    }
  }

  console.log(`\n=== Update Summary ===`);
  console.log(`Total members: ${members.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Unchanged: ${unchangedCount}`);
}

async function main() {
  try {
    const token = await login();
    await fixMemberPlanData(token);
    console.log('\n✓ Fix completed successfully!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
