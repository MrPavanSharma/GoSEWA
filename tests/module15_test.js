const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule15() {
  try {
    console.log('--- Starting Module 15 Verification ---');

    console.log('1. Setup context...');
    const TS = Date.now();
    const gEmail = `g_cert_${TS}@t.com`;
    await axios.post(`${BASE_URL}/auth/register`, { email: gEmail, password: 'Pass', phone: `98${TS.toString().slice(-8)}`, user_type: 'GAUSHALA' });
    const gLogin = await axios.post(`${BASE_URL}/auth/login`, { email: gEmail, password: 'Pass' });
    const gToken = gLogin.data.data.token;
    const gConfig = { headers: { Authorization: `Bearer ${gToken}` } };
    const userId = gLogin.data.data.user.id;

    // 2. Upload Certificate
    console.log('2. Uploading Certificate...');
    const upRes = await axios.post(`${BASE_URL}/certification/upload`, {
        name: 'Organic Standard',
        issuing_authority: 'Govt. of India',
        certificate_number: `CERT-${TS}`,
        issue_date: new Date(),
        expiry_date: new Date(Date.now() + 365*24*60*60*1000),
        document_url: 'http://docs.com/cert.pdf'
    }, gConfig);
    const certId = upRes.data.data.id;
    console.log('   Uploaded. ID:', certId);

    // 3. Verify Public List (Should be empty as it's not verified)
    const listRes1 = await axios.get(`${BASE_URL}/certification/${userId}/list`, gConfig);
    if (listRes1.data.data.length !== 0) throw new Error('Unverified cert shouldn\'t be listed');
    console.log('   Public View: Hidden (Correct)');

    // 4. Admin Verify
    console.log('4. Admin Verifying...');
    await axios.put(`${BASE_URL}/certification/${certId}/verify`, { is_verified: true }, gConfig);
    console.log('   Verified.');

    // 5. Verify Public List Again
    const listRes2 = await axios.get(`${BASE_URL}/certification/${userId}/list`, gConfig);
    if (listRes2.data.data.length !== 1) throw new Error('Verified cert should be listed');
    console.log('   Public View: Visible (Correct)');

    console.log('--- Module 15 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule15();
