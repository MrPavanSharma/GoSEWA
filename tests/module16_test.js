const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule16() {
  try {
    console.log('--- Starting Module 16 Verification ---');

    console.log('1. Setup context...');
    const TS = Date.now();
    const email = `user_sch_${TS}@t.com`;
    await axios.post(`${BASE_URL}/auth/register`, { email: email, password: 'Pass', phone: `98${TS.toString().slice(-8)}`, user_type: 'GAUSHALA' });
    const login = await axios.post(`${BASE_URL}/auth/login`, { email: email, password: 'Pass' });
    const token = login.data.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Create Scheme (Admin Shim)
    console.log('2. Creating Scheme...');
    const sRes = await axios.post(`${BASE_URL}/schemes/create`, {
        title: 'GOBARdhan Scheme',
        ministry: 'Jal Shakti',
        description: 'Biogas Support',
        funding_type: 'GRANT'
    }, config);
    const schemeId = sRes.data.data.id;
    console.log('   Scheme Created:', sRes.data.data.title);

    // 3. List Schemes (Public)
    console.log('3. Listing Schemes...');
    const listRes = await axios.get(`${BASE_URL}/schemes/list`);
    console.log('   Schemes found:', listRes.data.data.length);
    if (listRes.data.data.length === 0) throw new Error('No schemes found');

    // 4. Apply
    console.log('4. Applying...');
    const appRes = await axios.post(`${BASE_URL}/schemes/apply`, {
        scheme_id: schemeId,
        application_notes: 'I run a 500 cow gaushala.'
    }, config);
    console.log('   Applied. Status:', appRes.data.data.status);

    // 5. Verify My Applications
    const myRes = await axios.get(`${BASE_URL}/schemes/my-applications`, config);
    if(myRes.data.data.length !== 1) throw new Error('Application count mismatch');
    
    console.log('--- Module 16 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule16();
