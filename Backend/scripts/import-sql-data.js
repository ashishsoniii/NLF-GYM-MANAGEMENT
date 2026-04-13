const fs = require('fs');
const axios = require('axios');
const path = require('path');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const SQL_FILE_PATH = path.join(__dirname, '../../u343517709_nlf.sql');

function parseSQLInserts(sqlContent, tableName) {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES\\s*([\\s\\S]*?);`, 'gm');
  const match = regex.exec(sqlContent);

  if (!match || !match[1]) {
    console.log(`No data found for table: ${tableName}`);
    return [];
  }

  const valuesStr = match[1].trim();
  const rows = [];

  let currentRow = '';
  let inQuotes = false;
  let parenDepth = 0;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const prevChar = i > 0 ? valuesStr[i - 1] : '';

    if (char === "'" && prevChar !== '\\') {
      inQuotes = !inQuotes;
    }

    if (!inQuotes) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;

      if (parenDepth === 0 && char === ',' && valuesStr[i + 1] === '\n') {
        rows.push(currentRow.trim());
        currentRow = '';
        i++;
        continue;
      }
    }

    currentRow += char;
  }

  if (currentRow.trim()) {
    rows.push(currentRow.trim());
  }

  return rows.map(row => {
    const valueMatch = row.match(/^\((.*)\)$/);
    if (!valueMatch) return null;

    const values = [];
    let current = '';
    let inQuotes = false;
    let escaped = false;

    for (let i = 0; i < valueMatch[1].length; i++) {
      const char = valueMatch[1][i];

      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === "'") {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && char === ',') {
        values.push(current === 'NULL' ? null : current);
        current = '';
        continue;
      }

      current += char;
    }

    if (current !== '') {
      values.push(current === 'NULL' ? null : current);
    }

    return values;
  }).filter(row => row !== null);
}

function transformPlans(planRows) {
  return planRows.map(row => ({
    name: row[1],
    duration: parseInt(row[3]),
    price: parseInt(row[4]),
    description: row[2] || row[1],
    isActive: row[5] === 'yes'
  }));
}

function transformMembers(userRows, addressRows, enrollsRows) {
  const addressMap = {};
  addressRows.forEach(row => {
    addressMap[row[0]] = {
      streetName: row[1],
      state: row[2],
      city: row[3],
      zipcode: row[4]
    };
  });

  const userEnrollments = {};
  enrollsRows.forEach(row => {
    const uid = row[2];
    if (!userEnrollments[uid]) {
      userEnrollments[uid] = [];
    }
    userEnrollments[uid].push({
      planId: row[1],
      paidDate: row[3],
      expireDate: row[4],
      renewal: row[5]
    });
  });

  return userRows.map(row => {
    const userid = row[0];
    const address = addressMap[userid];
    const enrollments = userEnrollments[userid] || [];

    enrollments.sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));

    const latestEnrollment = enrollments[0];
    const payments = enrollments.map(enrollment => ({
      amount: 0,
      date: enrollment.paidDate,
      method: 'Cash',
      planName: enrollment.planId,
      expiryDate: enrollment.expireDate
    }));

    return {
      name: row[1],
      email: row[4] || `user_${userid}@placeholder.com`,
      phone: row[3],
      address: address ? `${address.streetName}, ${address.city}, ${address.state} ${address.zipcode}` : '',
      dateOfBirth: row[5],
      gender: row[2],
      joiningDate: row[6],
      expiryDate: latestEnrollment ? latestEnrollment.expireDate : null,
      latestPaymentDate: latestEnrollment ? latestEnrollment.paidDate : null,
      latestPaymentAmount: 0,
      latestPlanName: latestEnrollment ? latestEnrollment.planId : null,
      payments: payments,
      workoutType: 'General',
      assignedTrainer: null,
      isActive: latestEnrollment ? new Date(latestEnrollment.expireDate) > new Date() : false,
      notes: `Imported from SQL - Original ID: ${userid}`
    };
  });
}

async function login() {
  console.log('Logging in...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/adminLogin`, {
      email: process.env.ADMIN_EMAIL || 'mahendra@nlf.com',
      password: process.env.ADMIN_PASSWORD || 'admin'
    });

    if (response.data && response.data.token) {
      console.log('Login successful');
      return response.data.token;
    }

    throw new Error('No token received from login');
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function deleteAllPlans(token) {
  console.log('Fetching all plans to delete...');
  try {
    const response = await axios.get(`${API_BASE_URL}/plan`, {
      headers: { Authorization: token }
    });

    const plans = response.data.plans || response.data;
    console.log(`Found ${plans.length} plans to delete`);

    for (const plan of plans) {
      try {
        await axios.delete(`${API_BASE_URL}/plan/${plan._id}`, {
          headers: { Authorization: token }
        });
        console.log(`Deleted plan: ${plan.name}`);
      } catch (error) {
        console.error(`Failed to delete plan ${plan.name}:`, error.response?.data || error.message);
      }
    }

    console.log('All plans deleted');
  } catch (error) {
    console.error('Failed to fetch/delete plans:', error.response?.data || error.message);
  }
}

async function deleteAllMembers(token) {
  console.log('Fetching all members to delete...');
  try {
    const response = await axios.get(`${API_BASE_URL}/member/all`, {
      headers: { Authorization: token }
    });

    const members = response.data.members || response.data;
    console.log(`Found ${members.length} members to delete`);

    for (const member of members) {
      try {
        await axios.delete(`${API_BASE_URL}/member/delete/${member._id}`, {
          headers: { Authorization: token }
        });
        console.log(`Deleted member: ${member.name}`);
      } catch (error) {
        console.error(`Failed to delete member ${member.name}:`, error.response?.data || error.message);
      }
    }

    console.log('All members deleted');
  } catch (error) {
    console.error('Failed to fetch/delete members:', error.response?.data || error.message);
  }
}

async function importPlans(plans, token) {
  console.log(`Importing ${plans.length} plans...`);
  try {
    const response = await axios.post(
      `${API_BASE_URL}/plan/bulk-add`,
      { plans },
      { headers: { Authorization: token } }
    );

    console.log('Plans imported successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to import plans:', error.response?.data || error.message);
    throw error;
  }
}

async function importMembers(members, token, planIdMap) {
  console.log(`Importing ${members.length} members...`);

  const membersWithUpdatedPlanIds = members.map(member => {
    const updatedMember = { ...member };

    if (member.membershipPlan && planIdMap[member.membershipPlan]) {
      updatedMember.membershipPlan = planIdMap[member.membershipPlan];
    }

    return updatedMember;
  });

  const batchSize = 50;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < membersWithUpdatedPlanIds.length; i += batchSize) {
    const batch = membersWithUpdatedPlanIds.slice(i, i + batchSize);
    console.log(`Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(membersWithUpdatedPlanIds.length / batchSize)}...`);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/member/bulk-add`,
        { members: batch },
        {
          headers: { Authorization: token },
          timeout: 30000
        }
      );

      successCount += batch.length;
      console.log(`Batch imported: ${response.data.message || 'Success'}`);
    } catch (error) {
      failCount += batch.length;
      console.error(`Failed to import batch:`, error.response?.data || error.message);
    }
  }

  console.log(`Import complete: ${successCount} succeeded, ${failCount} failed`);
}

async function main() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');

    console.log('Parsing SQL data...');
    const planRows = parseSQLInserts(sqlContent, 'plan');
    const userRows = parseSQLInserts(sqlContent, 'users');
    const addressRows = parseSQLInserts(sqlContent, 'address');
    const enrollsRows = parseSQLInserts(sqlContent, 'enrolls_to');

    console.log(`Found ${planRows.length} plans, ${userRows.length} users, ${addressRows.length} addresses, ${enrollsRows.length} enrollments`);

    const plans = transformPlans(planRows);
    const members = transformMembers(userRows, addressRows, enrollsRows);

    console.log(`Transformed ${plans.length} plans and ${members.length} members`);

    const token = await login();

    if (process.env.DELETE_EXISTING !== 'false') {
      await deleteAllMembers(token);
      await deleteAllPlans(token);
    } else {
      console.log('Skipping deletion (DELETE_EXISTING=false)');
    }

    const planResponse = await importPlans(plans, token);

    const oldPlanIdToNew = {};
    if (planResponse && planResponse.plans) {
      planRows.forEach((oldRow, index) => {
        if (planResponse.plans[index]) {
          oldPlanIdToNew[oldRow[0]] = planResponse.plans[index]._id;
        }
      });
    }

    await importMembers(members, token, oldPlanIdToNew);

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseSQLInserts, transformPlans, transformMembers };
