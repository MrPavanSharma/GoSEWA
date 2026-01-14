const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule12() {
  try {
    console.log('--- Starting Module 12 Verification ---');

    console.log('1. Registering Transporter User...');
    const TS = Date.now();
    const EMAIL = `trans_${TS}@test.com`;
    const PASS = 'Test1234';

    await axios.post(`${BASE_URL}/auth/register`, { 
        email: EMAIL, password: PASS, phone: `97${TS.toString().slice(-8)}`, user_type: 'TRANSPORTER' 
    });
    const login = await axios.post(`${BASE_URL}/auth/login`, { email: EMAIL, password: PASS });
    const token = login.data.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Create Profile
    console.log('2. Creating Transporter Profile...');
    await axios.post(`${BASE_URL}/transporter/profile`, {
        company_name: 'FastCow Logistics',
        license_number: `LIC-${TS}`
    }, config);
    console.log('   Profile Created.');

    // 3. Add Vehicle
    console.log('3. Adding Vehicle...');
    const vRes = await axios.post(`${BASE_URL}/transporter/vehicles`, {
        vehicle_number: `MH-12-${TS.toString().slice(-4)}`,
        vehicle_type: 'REFRIGERATED_TRUCK',
        capacity_kg: 5000,
        is_refrigerated: true
    }, config);
    console.log('   Vehicle Added:', vRes.data.data.vehicle_number);

    // 4. Get Fleet
    console.log('4. Fetching Fleet...');
    const fleetRes = await axios.get(`${BASE_URL}/transporter/vehicles`, config);
    console.log('   Fleet Size:', fleetRes.data.data.length);
    
    if (fleetRes.data.data.length !== 1) throw new Error('Fleet count mismatch');

    console.log('--- Module 12 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule12();
