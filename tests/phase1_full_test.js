const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
const TIMESTAMP = Date.now();
const GAUSHALA_EMAIL = `gaushala_${TIMESTAMP}@test.com`;
const USER_EMAIL = `user_${TIMESTAMP}@test.com`;
const PASSWORD = 'Test1234';

async function phase1Test() {
  try {
    console.log('==============================================');
    console.log('       PHASE 1 COMPREHENSIVE VERIFICATION     ');
    console.log('==============================================');

    // --- Module 1: Auth ---
    console.log('\n[Module 1] User Registration & Auth');
    
    // Register Gaushala
    console.log(`   Registering Gaushala: ${GAUSHALA_EMAIL}`);
    await axios.post(`${BASE_URL}/auth/register`, {
        email: GAUSHALA_EMAIL, password: PASSWORD, phone: `98${TIMESTAMP.toString().slice(-8)}`, user_type: 'GAUSHALA'
    });
    const gLogin = await axios.post(`${BASE_URL}/auth/login`, { email: GAUSHALA_EMAIL, password: PASSWORD });
    const gToken = gLogin.data.data.token;
    const gConfig = { headers: { Authorization: `Bearer ${gToken}` } };
    console.log('   Gaushala Logged In.');

    // Register Entrepreneur
    console.log(`   Registering Entrepreneur: ${USER_EMAIL}`);
    await axios.post(`${BASE_URL}/auth/register`, {
        email: USER_EMAIL, password: PASSWORD, phone: `99${TIMESTAMP.toString().slice(-8)}`, user_type: 'ENTREPRENEUR'
    });
    const uLogin = await axios.post(`${BASE_URL}/auth/login`, { email: USER_EMAIL, password: PASSWORD });
    const uToken = uLogin.data.data.token;
    const uConfig = { headers: { Authorization: `Bearer ${uToken}` } };
    console.log('   Entrepreneur Logged In.');

    // --- Module 2: Profile ---
    console.log('\n[Module 2] Profile Management');
    console.log('   Updating Entrepreneur Profile & Address...');
    await axios.put(`${BASE_URL}/profile`, { full_name: 'Test Entrepreneur', description: 'Buyer' }, uConfig);
    const addrRes = await axios.post(`${BASE_URL}/profile/addresses`, {
        address_type: "SHIPPING", street_address: "123 Market St", city: "Test City", state: "TS", postal_code: "123456"
    }, uConfig);
    const addressId = addrRes.data.data.id;
    console.log('   Address Created.');

    // --- Module 3: Inventory ---
    console.log('\n[Module 3] Gaushala Inventory');
    console.log('   Creating Category & Product...');
    const catRes = await axios.post(`${BASE_URL}/inventory/categories`, {
        name: `Cat_${TIMESTAMP}`, description: 'Test Cat'
    }, gConfig);
    const catId = catRes.data.data.id;

    const prodRes = await axios.post(`${BASE_URL}/inventory/products`, {
        category_id: catId,
        name: `Gomaya Product ${TIMESTAMP}`,
        description: 'Premium organic',
        unit_type: 'KG',
        price_per_unit: 500,
        quality_grade: 'A',
        is_organic: true,
        initial_quantity: 100
    }, gConfig);
    const productId = prodRes.data.data.id;
    console.log(`   Product Created: ${prodRes.data.data.name} (Qty: 100)`);

    // --- Module 4: Marketplace ---
    console.log('\n[Module 4] Marketplace Browsing');
    console.log('   Searching for product...');
    const searchRes = await axios.get(`${BASE_URL}/marketplace/products/search?q=Gomaya`, uConfig);
    if (searchRes.data.data.length === 0) throw new Error('Search failed to find product');
    console.log('   Product Found in Search.');
    
    // Save Search
    await axios.post(`${BASE_URL}/marketplace/searches`, { name: 'Gomaya Alerts', search_query: 'Gomaya' }, uConfig);
    console.log('   Search Criteria Saved.');

    // --- Module 5: Order Management ---
    console.log('\n[Module 5] Order Management');
    console.log('   Adding to Cart...');
    await axios.post(`${BASE_URL}/orders/cart/items`, { product_id: productId, quantity: 10 }, uConfig);
    
    console.log('   Checking Out...');
    const checkoutRes = await axios.post(`${BASE_URL}/orders/checkout`, {
        shipping_address_id: addressId, billing_address_id: addressId
    }, uConfig);
    const orderId = checkoutRes.data.data.id;
    const totalAmount = checkoutRes.data.data.total_amount;
    console.log(`   Order Placed: ${orderId} (Total: ₹${totalAmount})`);

    // --- Module 6: Payments ---
    console.log('\n[Module 6] Payment Processing');
    console.log('   Processing Payment...');
    await axios.post(`${BASE_URL}/payments/process`, {
        order_id: orderId, payment_method: 'UPI', amount: totalAmount
    }, uConfig);
    console.log('   Payment Successful.');

    // Verify Invoice
    const invRes = await axios.get(`${BASE_URL}/payments/${orderId}/invoice`, uConfig);
    if (!invRes.data.data) throw new Error('Invoice not generated');
    console.log(`   Invoice Generated: ${invRes.data.data.invoice_number}`);

    // Verify Order Status Updated
    const orderCheck = await axios.get(`${BASE_URL}/orders/${orderId}`, uConfig);
    console.log(`   Final Order Status: ${orderCheck.data.data.order_status}`);
    console.log(`   Final Payment Status: ${orderCheck.data.data.payment_status}`);

    console.log('\n==============================================');
    console.log('   PHASE 1 VERIFICATION COMPLETE: ALL SUCCESS ');
    console.log('==============================================');

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!');
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
        console.error(error.stack);
    }
  }
}

phase1Test();
