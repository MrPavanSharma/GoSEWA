const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule7() {
  try {
    console.log('--- Starting Module 7 Verification ---');

    console.log('1. Setup context...');
    // Login User
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com', password: 'Test1234'
    });
    const token = loginRes.data.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Need a CONFIRMED order
    // 1. Get Product
    const prodRes = await axios.get(`${BASE_URL}/inventory/products`, config);
    if(prodRes.data.data.length === 0) throw new Error('No products to review');
    const productId = prodRes.data.data[0].id;

    // 2. Buy It
    await axios.post(`${BASE_URL}/orders/cart/items`, { product_id: productId, quantity: 1 }, config);
    // Reuse address if exists, else create (simplified)
    const profile = await axios.get(`${BASE_URL}/profile`, config);
    let addrId = profile.data.data.Addresses[0]?.id;
    if(!addrId){
         const addr = await axios.post(`${BASE_URL}/profile/addresses`, {
            address_type: "SHIPPING", street_address: "St", city: "C", state: "S", postal_code: "1"
        }, config);
        addrId = addr.data.data.id;
    }

    const checkout = await axios.post(`${BASE_URL}/orders/checkout`, {
        shipping_address_id: addrId, billing_address_id: addrId
    }, config);
    const orderId = checkout.data.data.id;
    const amount = checkout.data.data.total_amount;

    // 3. Pay for it (to make it confirmed)
    await axios.post(`${BASE_URL}/payments/process`, {
        order_id: orderId, payment_method: 'UPI', amount
    }, config);
    console.log('   Context: Order Purchased & Paid.');

    // 2. Add Review
    console.log('2. Adding Review...');
    const reviewRes = await axios.post(`${BASE_URL}/reviews`, {
        order_id: orderId,
        product_id: productId,
        rating: 5,
        comment: 'Excellent quality cow product!'
    }, config);
    console.log('   Review Added:', reviewRes.data.data.id);

    // 3. Duplicate Check
    console.log('3. Testing Duplicate Review...');
    try {
        await axios.post(`${BASE_URL}/reviews`, {
            order_id: orderId, product_id: productId, rating: 1, comment: 'Spam'
        }, config);
    } catch (e) {
        console.log('   Duplicate blocked as expected:', e.response.data.message);
    }

    // 4. View Reviews
    console.log('4. Fetching Product Reviews...');
    const listRes = await axios.get(`${BASE_URL}/reviews/product/${productId}`);
    console.log('   Reviews Count:', listRes.data.data.length);
    console.log('   First Comment:', listRes.data.data[0].comment);

    console.log('--- Module 7 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule7();
