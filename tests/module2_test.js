const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule2() {
  try {
    console.log('--- Starting Module 2 Verification ---');

    console.log('0. Registering User (if needed)...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test@example.com',
        password: 'Test1234',
        phone: '9999999999',
        user_type: 'GAUSHALA'
      });
      console.log('   User registered.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('   User likely already exists (400). Proceeding to login.');
      } else {
        throw err;
      }
    }

    console.log('1. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test1234'
    });
    const token = loginRes.data.data.token;
    console.log('   Login successful. Token received.');

    const config = { headers: { Authorization: `Bearer ${token}` } };

    console.log('2. Updating Profile...');
    await axios.put(`${BASE_URL}/profile`, {
      full_name: "Ramesh Kumar",
      business_name: "Ramesh Dairy",
      gst_number: "22AAAAA0000A1Z5",
      description: "Best organic milk provider"
    }, config);
    console.log('   Profile updated.');

    console.log('3. Adding Address...');
    await axios.post(`${BASE_URL}/profile/addresses`, {
      address_type: "BUSINESS",
      street_address: "123 Main Road",
      city: "Jaipur",
      state: "Rajasthan",
      postal_code: "302001",
      is_default: true
    }, config);
    console.log('   Address added.');

    console.log('4. Uploading Document (Simulated)...');
    await axios.post(`${BASE_URL}/profile/documents`, {
      document_type: "GST_CERTIFICATE",
      document_url: "s3://bucket/gst_cert.pdf"
    }, config);
    console.log('   Document uploaded.');

    console.log('5. Fetching Full Profile...');
    const profileRes = await axios.get(`${BASE_URL}/profile`, config);
    const data = profileRes.data.data;
    
    // Check if profile exists (using optional chaining for safety)
    const profileName = data.UserProfile?.full_name;
    const addressCount = data.Addresses?.length;
    const docCount = data.BusinessDocuments?.length;

    if (profileName === "Ramesh Kumar" && addressCount > 0 && docCount > 0) {
      console.log('   Profile verification PASSED!');
      console.log('   Full Name:', profileName);
      console.log('   Addresses:', addressCount);
      console.log('   Documents:', docCount);
    } else {
      console.error('   Profile verification FAILED. Data mismatch.');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule2();
