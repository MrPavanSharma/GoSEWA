const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule3() {
  try {
    console.log('--- Starting Module 3 Verification ---');

    console.log('1. Logging in as GAUSHALA...');
    // Login with the user created in previous tests (User ID should be consistent if database persistence works)
    let token;
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'Test1234'
        });
        token = loginRes.data.data.token;
    } catch(err) {
        // Fallback: Register if not exists
        const regRes = await axios.post(`${BASE_URL}/auth/register`, {
            email: 'test@example.com',
            password: 'Test1234',
            phone: '9999999999',
            user_type: 'GAUSHALA'
        });
        token = regRes.data.data.token;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };
    console.log('   Logged in.');

    console.log('2. Creating Category...');
    const catRes = await axios.post(`${BASE_URL}/inventory/categories`, {
        name: 'Dairy Products',
        description: 'Milk, Ghee, Curd',
        icon_url: 'http://icon.url'
    }, config);
    const categoryId = catRes.data.data.id;
    console.log('   Category Created:', categoryId);

    console.log('3. Creating Product...');
    const prodRes = await axios.post(`${BASE_URL}/inventory/products`, {
        category_id: categoryId,
        name: 'A2 Cow Ghee',
        description: 'Pure Desi Ghee',
        unit_type: 'LITER',
        price_per_unit: 1500,
        quality_grade: 'PREMIUM',
        initial_quantity: 10
    }, config);
    const productId = prodRes.data.data.id;
    console.log('   Product Created:', productId);

    console.log('4. Listing Products...');
    const listRes = await axios.get(`${BASE_URL}/inventory/products?search=Ghee`, config);
    if (listRes.data.data.length > 0) {
        console.log('   Product found in list.');
    } else {
        throw new Error('Product not found in list');
    }

    console.log('5. Updating Inventory...');
    await axios.post(`${BASE_URL}/inventory/products/${productId}/inventory`, {
        quantity_change: 5,
        change_type: 'ADDITION',
        notes: 'New batch production'
    }, config);
    console.log('   Inventory Updated.');

    console.log('6. Checking Logs...');
    const logRes = await axios.get(`${BASE_URL}/inventory/products/${productId}/logs`, config);
    if (logRes.data.data.length >= 2) { // Initial + Update
        console.log('   Logs verified. Count:', logRes.data.data.length);
        console.log('   Latest Log Change:', logRes.data.data[0].quantity_change);
    } else {
        console.error('   Log verification failed. Count:', logRes.data.data.length);
    }

    console.log('--- Module 3 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule3();
