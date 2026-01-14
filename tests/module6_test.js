const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule6() {
  try {
    console.log('--- Starting Module 6 Verification ---');

    console.log('1. Setup Data (Login + Order)...');
    let token, orderId;
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com', password: 'Test1234'
        });
        token = loginRes.data.data.token;
    } catch(err) { throw err; }
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Get an existing order from Mod 5 test or create one
    // Assuming Module 5 test ran, let's list orders and pick one OR create fresh
    // Ideally create fresh to ensure clean state
    
    // Create Cart & Checkout
    const prodList = await axios.get(`${BASE_URL}/inventory/products`, config);
    if(prodList.data.data.length === 0) throw new Error('No products');
    const productId = prodList.data.data[0].id;

    await axios.post(`${BASE_URL}/orders/cart/items`, { product_id: productId, quantity: 1 }, config);
    // Ensure address exists
    const profileRes = await axios.get(`${BASE_URL}/profile`, config);
    let addressId = profileRes.data.data.Addresses[0]?.id;
    if(!addressId) {
         const addrRes = await axios.post(`${BASE_URL}/profile/addresses`, {
            address_type: "SHIPPING", street_address: "Pay St", city: "City", state: "ST", postal_code: "000000"
        }, config);
        addressId = addrRes.data.data.id;
    }

    const checkoutRes = await axios.post(`${BASE_URL}/orders/checkout`, {
        shipping_address_id: addressId, billing_address_id: addressId
    }, config);
    orderId = checkoutRes.data.data.id;
    const amount = checkoutRes.data.data.total_amount;
    console.log('   Order Created:', orderId, 'Amount:', amount);

    // 2. Process Payment
    console.log('2. Processing Payment...');
    const payRes = await axios.post(`${BASE_URL}/payments/process`, {
        order_id: orderId,
        payment_method: 'UPI',
        amount: amount 
    }, config);
    console.log('   Payment Success:', payRes.data.data.status);
    const paymentId = payRes.data.data.id;

    // 3. Verify Order Status
    console.log('3. Verifying Order Status...');
    const orderRes = await axios.get(`${BASE_URL}/orders/${orderId}`, config);
    console.log('   Order Status:', orderRes.data.data.order_status);
    console.log('   Payment Status:', orderRes.data.data.payment_status);
    
    if (orderRes.data.data.payment_status !== 'PAID') throw new Error('Order not marked as PAID');

    // 4. Check Invoice
    console.log('4. Checking Invoice...');
    const invRes = await axios.get(`${BASE_URL}/payments/${orderId}/invoice`, config);
    console.log('   Invoice Generated:', invRes.data.data.invoice_number);

    // 5. Initiate Refund (Test)
    console.log('5. Initiating Refund...');
    await axios.post(`${BASE_URL}/payments/refund`, {
        payment_id: paymentId,
        amount: amount,
        reason: 'Customer Request'
    }, config);
    console.log('   Refund Initiated.');

    console.log('--- Module 6 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule6();
