const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule5() {
  try {
    console.log('--- Starting Module 5 Verification ---');

    console.log('1. Setting up Data (Register/Login)...');
    let token;
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'Test1234'
        });
        token = loginRes.data.data.token;
    } catch(err) { throw err; }
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Get a product ID (created in Mod 3)
    const prodList = await axios.get(`${BASE_URL}/inventory/products`, config);
    if (prodList.data.data.length === 0) throw new Error('No products available for order test.');
    const product = prodList.data.data[0];
    const productId = product.id;
    console.log('   Using Product:', product.name, `(${productId})`);

    // 2. Add to Cart
    console.log('2. Adding to Cart...');
    await axios.post(`${BASE_URL}/orders/cart/items`, {
        product_id: productId,
        quantity: 2
    }, config);
    console.log('   Item added.');

    // 3. View Cart
    console.log('3. Viewing Cart...');
    const cartRes = await axios.get(`${BASE_URL}/orders/cart`, config);
    const cart = cartRes.data.data;
    console.log('   Cart Items:', cart.item_count, 'Total:', cart.total_amount);
    if (cart.CartItems.length === 0) throw new Error('Cart is empty after addition');

    // 4. Checkout
    console.log('4. Checkout...');
    // Need address ID (from Mod 2)
    const profileRes = await axios.get(`${BASE_URL}/profile`, config);
    const addressId = profileRes.data.data.Addresses[0]?.id; // Assuming one exists from previous test
    
    if (!addressId) { 
        console.warn('   No address found, creating one...');
        const addrRes = await axios.post(`${BASE_URL}/profile/addresses`, {
            address_type: "SHIPPING", street_address: "Test St", city: "City", state: "ST", postal_code: "000000"
        }, config);
        // Use the new address ID
    }

    const orderRes = await axios.post(`${BASE_URL}/orders/checkout`, {
        shipping_address_id: addressId,
        billing_address_id: addressId
    }, config);
    const orderId = orderRes.data.data.id;
    console.log('   Order Placed. ID:', orderId, 'Status:', orderRes.data.data.order_status);

    // 5. Get Orders
    console.log('5. Listing Orders...');
    const ordersRes = await axios.get(`${BASE_URL}/orders`, config);
    console.log('   Total Orders:', ordersRes.data.data.length);

    // 6. Update Status
    console.log('6. Updating Status...');
    await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
        status: 'PROCESSING',
        notes: 'Processing started'
    }, config);
    console.log('   Status Updated to PROCESSING.');

    console.log('--- Module 5 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule5();
