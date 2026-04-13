const axios = require('axios');

async function check() {
  try {
    const loginResponse = await axios.post('http://localhost:3001/auth/adminLogin', {
      email: 'mahendra@nlf.com',
      password: 'admin'
    });

    const token = loginResponse.data.token;

    const membersResponse = await axios.get('http://localhost:3001/member/all', {
      headers: { Authorization: token }
    });

    const members = membersResponse.data.members || [];

    if (members.length > 0) {
      console.log('Sample member data structure:');
      console.log(JSON.stringify(members[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
