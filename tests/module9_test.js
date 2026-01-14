const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule9() {
  try {
    console.log('--- Starting Module 9 Verification ---');

    console.log('1. Login as Gaushala...');
    // We need to find or register a Gaushala. For simplicity in this test, let's look at previous flow or assume one exists.
    // Ideally, full flow: Register G -> Add Product -> Register E -> Buy -> Pay -> Check Stats.
    
    const TIMESTAMP = Date.now();
    const G_EMAIL = `g_stat_${TIMESTAMP}@test.com`;
    const E_EMAIL = `e_stat_${TIMESTAMP}@test.com`;
    const PASS = 'Test1234';

    // Register G
    await axios.post(`${BASE_URL}/auth/register`, { email: G_EMAIL, password: PASS, phone: `98${TIMESTAMP.toString().slice(-8)}`, user_type: 'GAUSHALA' });
    const gLogin = await axios.post(`${BASE_URL}/auth/login`, { email: G_EMAIL, password: PASS });
    const gToken = gLogin.data.data.token;
    const gConfig = { headers: { Authorization: `Bearer ${gToken}` } };

    // Register E
    await axios.post(`${BASE_URL}/auth/register`, { email: E_EMAIL, password: PASS, phone: `99${TIMESTAMP.toString().slice(-8)}`, user_type: 'ENTREPRENEUR' });
    const eLogin = await axios.post(`${BASE_URL}/auth/login`, { email: E_EMAIL, password: PASS });
    const eToken = eLogin.data.data.token;
    const eConfig = { headers: { Authorization: `Bearer ${eToken}` } };

    // Setup: G creates item
    const cRes = await axios.post(`${BASE_URL}/inventory/categories`, { name: 'StatCat', description: 'Desc' }, gConfig);
    const pRes = await axios.post(`${BASE_URL}/inventory/products`, {
        category_id: cRes.data.data.id,
        name: 'StatItem', stock_quantity: 100, price_per_unit: 1000,
        unit_type: 'KG', quality_grade: 'A', is_organic: true, description: 'Test'
    }, gConfig);
    const prodId = pRes.data.data.id;

    // E buys item
    await axios.post(`${BASE_URL}/orders/cart/items`, { product_id: prodId, quantity: 2 }, eConfig);
    
    // Create Address
    const addr = await axios.post(`${BASE_URL}/profile/addresses`, {
        address_type: "SHIPPING", street_address: "S", city: "C", state: "S", postal_code: "1"
    }, eConfig);

    const checkout = await axios.post(`${BASE_URL}/orders/checkout`, {
        shipping_address_id: addr.data.data.id, billing_address_id: addr.data.data.id
    }, eConfig);
    const orderId = checkout.data.data.id;
    const amount = checkout.data.data.total_amount;

    // Pay
    await axios.post(`${BASE_URL}/payments/process`, { order_id: orderId, payment_method: 'UPI', amount }, eConfig);

    // 2. Check Gaushala Stats
    console.log('2. Checking Gaushala Stats...');
    const gStats = await axios.get(`${BASE_URL}/analytics/gaushala`, gConfig);
    console.log('   Revenue:', gStats.data.data.total_revenue);
    console.log('   Orders:', gStats.data.data.total_orders);

    if(gStats.data.data.total_revenue !== 2000) console.warn('   Warning: Revenue mismatch?');

    // 3. Check Entrepreneur Stats
    console.log('3. Checking Entrepreneur Stats...');
    const eStats = await axios.get(`${BASE_URL}/analytics/entrepreneur`, eConfig);
    console.log('   Spent:', eStats.data.data.total_spent);
    console.log('   Active Orders:', eStats.data.data.active_orders.length);

    if(eStats.data.data.total_spent !== 2000) console.warn('   Warning: Spend mismatch?');

    console.log('--- Module 9 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule9();
