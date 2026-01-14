const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markAsRead);

// Temporary endpoint for testing manual triggers
router.post('/send', notificationController.sendManualNotification);

module.exports = router;
