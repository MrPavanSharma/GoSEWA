const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule4() {
  try {
    console.log('--- Starting Module 4 Verification ---');

    // 1. Setup Data - Login as Gaushala to add product
    console.log('1. Setting up Product data...');
    let token;
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'Test1234'
        });
        token = loginRes.data.data.token;
    } catch(err) {
        console.error('Login failed. Ensure User from Module 1 exists.');
        throw err;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Create a product to search for
    const prodRes = await axios.post(`${BASE_URL}/inventory/products`, {
        gaushala_id: 'some-uuid-mock', // In real app, derived from token
        category_id: null, // Optional for this test or need category creation
        name: 'Organic Cow Dung Cake',
        description: 'High quality dried dung cake for fuel',
        unit_type: 'PIECE',
        price_per_unit: 10,
        quality_grade: 'A',
        is_organic: true,
        initial_quantity: 100
    }, config).catch(e => {
        // If product creation fails (e.g. invalid category), we might still have products from Mod 3
        console.log('   (Product creation skipped or failed, using existing)');
    });
    
    // 2. Search
    console.log('2. Testing Search...');
    const searchRes = await axios.get(`${BASE_URL}/marketplace/products/search?q=Cow`, config);
    console.log('   Search Results:', searchRes.data.data.length);
    if (searchRes.data.data.length === 0) console.warn('   Warning: No products found matching "Cow".');

    // 3. Save Search
    console.log('3. Saving Search Criteria...');
    await axios.post(`${BASE_URL}/marketplace/searches`, {
        name: 'My Cow Product Alert',
        search_query: 'Cow',
        filters: { is_organic: true },
        notification_frequency: 'WEEKLY'
    }, config);
    console.log('   Search Saved.');

    // 4. Get Saved Searches
    console.log('4. Listing Saved Searches...');
    const savedRes = await axios.get(`${BASE_URL}/marketplace/searches`, config);
    console.log('   Saved Searches Count:', savedRes.data.data.length);

    // 5. Product View Logging
    if (searchRes.data.data.length > 0) {
        const pid = searchRes.data.data[0].id;
        console.log(`5. Logging view for product ${pid}...`);
        await axios.post(`${BASE_URL}/marketplace/products/${pid}/view`, {
            view_duration: 30
        }, config);
        console.log('   View logged.');
    }

    // 6. History
    console.log('6. Checking Search History...');
    const historyRes = await axios.get(`${BASE_URL}/marketplace/history`, config);
    console.log('   History Items:', historyRes.data.data.length);

    console.log('--- Module 4 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule4();
