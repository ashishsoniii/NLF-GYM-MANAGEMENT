const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function verify() {
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/adminLogin`, {
      email: 'mahendra@nlf.com',
      password: 'admin'
    });

    const token = loginResponse.data.token;

    const plansResponse = await axios.get(`${API_BASE_URL}/plan`, {
      headers: { Authorization: token }
    });

    const membersResponse = await axios.get(`${API_BASE_URL}/member/all`, {
      headers: { Authorization: token }
    });

    const plans = Array.isArray(plansResponse.data) ? plansResponse.data : (plansResponse.data.plans || []);
    const members = membersResponse.data.members || [];

    console.log('\n=== IMPORT VERIFICATION ===\n');
    console.log(`Total Plans Imported: ${plans.length}`);
    console.log(`Total Members Imported: ${members.length}\n`);

    console.log('Sample Plans:');
    plans.slice(0, 5).forEach(plan => {
      console.log(`  - ${plan.name} (${plan.duration} months, ₹${plan.price})`);
    });

    console.log('\nSample Members:');
    members.slice(0, 10).forEach(member => {
      console.log(`  - ${member.name} (${member.email}) - Active: ${member.isActive}`);
    });

    console.log('\n=== VERIFICATION COMPLETE ===\n');
    console.log('Summary:');
    console.log(`  ✓ ${plans.length} plans imported successfully`);
    console.log(`  ✓ ${members.length} members imported successfully`);

    const activeMembers = members.filter(m => m.isActive).length;
    console.log(`  ✓ ${activeMembers} active members`);
    console.log(`  ✓ ${members.length - activeMembers} inactive members`);
  } catch (error) {
    console.error('Verification failed:', error.response?.data || error.message);
  }
}

verify();
