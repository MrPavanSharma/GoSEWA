const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule10() {
  try {
    console.log('--- Starting Module 10 Verification ---');

    // 1. Setup Context (Need Order + Payment)
    console.log('1. Setup context...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com', password: 'Test1234'
    });
    const token = loginRes.data.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Create new order to be safe
    const prodRes = await axios.get(`${BASE_URL}/inventory/products`, config);
    const productId = prodRes.data.data[0].id;
    await axios.post(`${BASE_URL}/orders/cart/items`, { product_id: productId, quantity: 1 }, config);
    const profile = await axios.get(`${BASE_URL}/profile`, config);
    const addrId = profile.data.data.Addresses[0].id;
    
    const checkout = await axios.post(`${BASE_URL}/orders/checkout`, {
        shipping_address_id: addrId, billing_address_id: addrId
    }, config);
    const orderId = checkout.data.data.id;
    const amount = checkout.data.data.total_amount;

    // Pay
    await axios.post(`${BASE_URL}/payments/process`, { order_id: orderId, payment_method: 'UPI', amount }, config);
    console.log('   Order Paid:', orderId);

    // 2. Check Rates
    console.log('2. Checking Shipping Rates...');
    const rateRes = await axios.post(`${BASE_URL}/logistics/rates`, {
        weight: 5, destination_pincode: '110001'
    }, config);
    console.log('   Rates received:', rateRes.data.data.length);
    console.log('   First Option:', rateRes.data.data[0].carrier, rateRes.data.data[0].price);

    // 3. Book Shipment (AS GAUSHALA - but we are logged in as Entrepreneur? Wait.
    // Logistics booking is usually done by SELLER (Gaushala).
    // Let's login as Gaushala to book it.
    // Requires finding the Gaushala user.
    // For simplicity, let's assume the test user is the gaushala OR the controller allows E to book (which is wrong but check implementation).
    // Reviewing implementation: `const userId = req.user.id; ... where: { gaushala_id: userId }`
    // So ONLY Gaushala can book.
    
    // We need to login as the Gaushala who owns the product.
    // Let's create a fresh Gaushala flow or cheat by ensuring current user IS the gaushala?
    // In `testModule9`, we created `g_stat...`. Let's use a similar approach or just register a new G, add item, buy item (as E), then login as G to ship.
    
    // --- RESTARTING CONTEXT FOR ROLE ACCURACY ---
    console.log('   * Switching to Role-based flow *');
    const TS = Date.now();
    
    // Register G
    await axios.post(`${BASE_URL}/auth/register`, { email: `g_log_${TS}@t.com`, password: 'Pass', phone: `98${TS.toString().slice(-8)}`, user_type: 'GAUSHALA' });
    const gLog = await axios.post(`${BASE_URL}/auth/login`, { email: `g_log_${TS}@t.com`, password: 'Pass' });
    const gToken = gLog.data.data.token;
    const gConfig = { headers: { Authorization: `Bearer ${gToken}` } };

    // Register E
    await axios.post(`${BASE_URL}/auth/register`, { email: `e_log_${TS}@t.com`, password: 'Pass', phone: `99${TS.toString().slice(-8)}`, user_type: 'ENTREPRENEUR' });
    const eLog = await axios.post(`${BASE_URL}/auth/login`, { email: `e_log_${TS}@t.com`, password: 'Pass' });
    const eToken = eLog.data.data.token;
    const eConfig = { headers: { Authorization: `Bearer ${eToken}` } };

    // G creates product
    const cRes = await axios.post(`${BASE_URL}/inventory/categories`, { name: `CatLog`, description: 'D' }, gConfig);
    const pRes = await axios.post(`${BASE_URL}/inventory/products`, {
        category_id: cRes.data.data.id, name: 'ShipItem', stock_quantity: 10, price_per_unit: 100, unit_type: 'KG', quality_grade: 'A', is_organic: true, description: 'Desc'
    }, gConfig);
    const pId = pRes.data.data.id;

    // E buys
    await axios.post(`${BASE_URL}/profile/addresses`, { address_type: "SHIPPING", street_address: "S", city: "C", state: "S", postal_code: "1" }, eConfig);
    const eProf = await axios.get(`${BASE_URL}/profile`, eConfig);
    const eAddr = eProf.data.data.Addresses[0].id;

    await axios.post(`${BASE_URL}/orders/cart/items`, { product_id: pId, quantity: 1 }, eConfig);
    const eCheck = await axios.post(`${BASE_URL}/orders/checkout`, { shipping_address_id: eAddr, billing_address_id: eAddr }, eConfig);
    const oId = eCheck.data.data.id;

    // E pays
    await axios.post(`${BASE_URL}/payments/process`, { order_id: oId, payment_method: 'UPI', amount: eCheck.data.data.total_amount }, eConfig);

    // 4. G Books Shipment
    console.log('4. Gaushala Booking Shipment...');
    const shipRes = await axios.post(`${BASE_URL}/logistics/book`, {
        order_id: oId, carrier: 'Delhivery', service: 'Standard'
    }, gConfig);
    
    console.log('   Shipment Booked:', shipRes.data.data.tracking_number);
    console.log('   Status:', shipRes.data.data.status);

    // 5. Verify Order Status Updated
    const oVerify = await axios.get(`${BASE_URL}/orders/${oId}`, eConfig);
    console.log('   Order Status:', oVerify.data.data.order_status); // Should be SHIPPED

    if (oVerify.data.data.order_status !== 'SHIPPED') throw new Error('Order status not updated to SHIPPED');

    console.log('--- Module 10 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule10();
