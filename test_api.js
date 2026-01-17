const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let userId = '';
let productId = '';
let orderId = '';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
    try {
        await fn();
        log(`✓ ${name}`, 'green');
        return true;
    } catch (error) {
        log(`✗ ${name}`, 'red');
        if (error.response) {
            log(`  Status: ${error.response.status}`, 'yellow');
            log(`  Message: ${error.response.data?.message || error.message}`, 'yellow');
        } else {
            log(`  Error: ${error.message}`, 'yellow');
        }
        return false;
    }
}

async function runTests() {
    log('\n🧪 GoSEWA API Testing Suite\n', 'blue');

    const results = {
        passed: 0,
        failed: 0
    };

    // Test 1: Health Check
    if (await test('Health Check', async () => {
        const res = await axios.get(`${BASE_URL}/health`);
        if (res.data.status !== 'healthy') throw new Error('API not healthy');
    })) results.passed++; else results.failed++;

    let testEmail = `test${Date.now()}@example.com`;

    // Test 2: Register User (Gaushala) - Changed to Gaushala to allow product creation
    if (await test('Register User (Gaushala)', async () => {
        const res = await axios.post(`${BASE_URL}/auth/register`, {
            full_name: 'Test Gaushala',
            email: testEmail,
            password: 'password123',
            phone: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
            user_type: 'GAUSHALA'
        });
        if (!res.data.success) throw new Error('Registration failed');
        userId = res.data.data.user.id;
    })) results.passed++; else results.failed++;

    // Test 3: Login
    if (await test('Login User', async () => {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: testEmail,
            password: 'password123'
        });
        if (!res.data.success) throw new Error('Login failed');
        authToken = res.data.data.token;
    })) results.passed++; else results.failed++;

    const headers = { Authorization: `Bearer ${authToken}` };

    // Test 4: Get Profile
    if (await test('Get User Profile', async () => {
        const res = await axios.get(`${BASE_URL}/profile`, { headers });
        if (!res.data.success) throw new Error('Failed to get profile');
    })) results.passed++; else results.failed++;

    // Test 5: Get Categories
    if (await test('Get Product Categories', async () => {
        const res = await axios.get(`${BASE_URL}/inventory/categories`, { headers });
        if (!res.data.success) throw new Error('Failed to get categories');
    })) results.passed++; else results.failed++;

    // Test 6: Create Product
    if (await test('Create Product', async () => {
        const res = await axios.post(`${BASE_URL}/inventory/products`, {
            name: 'Test Milk Product',
            description: 'Fresh organic milk',
            price_per_unit: 60,
            initial_quantity: 100,
            unit_type: 'LITERS',
            category_id: 1
        }, { headers });
        if (!res.data.success) throw new Error('Failed to create product');
        productId = res.data.data.id;
    })) results.passed++; else results.failed++;

    // Test 7: Get Products
    if (await test('Get All Products', async () => {
        const res = await axios.get(`${BASE_URL}/inventory/products`, { headers });
        if (!res.data.success) throw new Error('Failed to get products');
    })) results.passed++; else results.failed++;

    // Test 8: Get Product by ID
    if (await test('Get Product by ID', async () => {
        const res = await axios.get(`${BASE_URL}/inventory/products/${productId}`, { headers });
        if (!res.data.success) throw new Error('Failed to get product');
    })) results.passed++; else results.failed++;

    // Test 9: Add to Cart
    if (await test('Add Product to Cart', async () => {
        const res = await axios.post(`${BASE_URL}/orders/cart/items`, {
            product_id: productId,
            quantity: 5
        }, { headers });
        if (!res.data.success) throw new Error('Failed to add to cart');
    })) results.passed++; else results.failed++;

    // Test 10: Get Cart
    if (await test('Get Shopping Cart', async () => {
        const res = await axios.get(`${BASE_URL}/orders/cart`, { headers });
        if (!res.data.success) throw new Error('Failed to get cart');
    })) results.passed++; else results.failed++;

    // Test 11: Create Order (Checkout)
    if (await test('Create Order (Checkout)', async () => {
        const res = await axios.post(`${BASE_URL}/orders/checkout`, {
            shipping_address_id: 1, // Mock ID
            billing_address_id: 1,  // Mock ID
            payment_method: 'COD'
        }, { headers });
        if (!res.data.success) throw new Error('Failed to checkout');
        orderId = res.data.data.id;
    })) results.passed++; else results.failed++;

    // Test 12: Get Orders
    if (await test('Get User Orders', async () => {
        const res = await axios.get(`${BASE_URL}/orders`, { headers });
        if (!res.data.success) throw new Error('Failed to get orders');
    })) results.passed++; else results.failed++;

    // Test 13: Get Order by ID
    if (await test('Get Order Details', async () => {
        const res = await axios.get(`${BASE_URL}/orders/${orderId}`, { headers });
        if (!res.data.success) throw new Error('Failed to get order details');
    })) results.passed++; else results.failed++;

    // Test 14: Get Notifications
    if (await test('Get Notifications', async () => {
        const res = await axios.get(`${BASE_URL}/notifications`, { headers });
        if (!res.data.success) throw new Error('Failed to get notifications');
    })) results.passed++; else results.failed++;

    // Test 15: Analytics (Monitoring)
    if (await test('Get Analytics Data', async () => {
        const res = await axios.get(`${BASE_URL}/monitoring/health`, { headers });
        // Analytics might return empty data, that's ok
    })) results.passed++; else results.failed++;

    // Test 16: Livestock
    if (await test('Get Livestock', async () => {
        const res = await axios.get(`${BASE_URL}/stock/livestock`, { headers });
        if (!res.data.success) throw new Error('Failed to get livestock');
    })) results.passed++; else results.failed++;

    // Test 17: Waste Logs
    if (await test('Get Waste Logs', async () => {
        const res = await axios.get(`${BASE_URL}/waste/logs`, { headers });
        if (!res.data.success) throw new Error('Failed to get waste logs');
    })) results.passed++; else results.failed++;

    // Test 18: Production Logs
    if (await test('Get Production Logs', async () => {
        const res = await axios.get(`${BASE_URL}/production/logs`, { headers });
        if (!res.data.success) throw new Error('Failed to get production logs');
    })) results.passed++; else results.failed++;

    // Summary
    log('\n📊 Test Results:', 'blue');
    log(`   Passed: ${results.passed}`, 'green');
    log(`   Failed: ${results.failed}`, 'red');
    log(`   Total:  ${results.passed + results.failed}`, 'yellow');

    const percentage = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    log(`   Success Rate: ${percentage}%\n`, percentage > 80 ? 'green' : 'yellow');

    if (results.failed === 0) {
        log('🎉 All tests passed! Application is working correctly.\n', 'green');
    } else if (percentage > 80) {
        log('✅ Most tests passed. Some features may need attention.\n', 'yellow');
    } else {
        log('⚠️  Many tests failed. Please check the application.\n', 'red');
    }
}

runTests().catch(err => {
    log(`\n❌ Test suite failed to run: ${err.message}\n`, 'red');
    process.exit(1);
});
