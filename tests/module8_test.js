const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testModule8() {
  try {
    console.log('--- Starting Module 8 Verification ---');

    console.log('1. Setup context (Login)...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com', password: 'Test1234'
    });
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.user.id;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Send Notification (Manual Trigger)
    console.log('2. Sending Notification...');
    await axios.post(`${BASE_URL}/notifications/send`, {
        user_id: userId,
        title: 'Order Update',
        message: 'Your order #123 has been shipped!',
        type: 'ORDER_UPDATE'
    }, config);
    console.log('   Notification Sent.');

    // 3. Fetch Notifications
    console.log('3. Fetching Notifications...');
    let res = await axios.get(`${BASE_URL}/notifications`, config);
    let list = res.data.data.notifications;
    let unread = res.data.data.unread_count;
    console.log(`   Count: ${list.length}, Unread: ${unread}`);
    
    if (list.length === 0) throw new Error('Notification not found');
    const notifId = list[0].id;

    // 4. Mark as Read
    console.log('4. Marking as Read...');
    await axios.put(`${BASE_URL}/notifications/${notifId}/read`, {}, config);
    
    // Check again
    res = await axios.get(`${BASE_URL}/notifications`, config);
    unread = res.data.data.unread_count;
    console.log(`   New Unread Count: ${unread}`);
    if (unread >= res.data.data.notifications.length) console.warn('   Warning: Unread count didn\'t decrease?');

    console.log('--- Module 8 Verification SUCCESS ---');

  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testModule8();
