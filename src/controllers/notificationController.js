const { Notification, User } = require('../models');

// Fetch User Notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 50 // Cap for performance
    });
    
    // Count unread
    const unreadCount = await Notification.count({ where: { user_id: userId, is_read: false } });

    res.json({ success: true, data: { notifications, unread_count: unreadCount } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark as Read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params; // 'all' or specific ID
    const userId = req.user.id;

    if (id === 'all') {
        await Notification.update({ is_read: true, read_at: new Date() }, {
            where: { user_id: userId, is_read: false }
        });
    } else {
        await Notification.update({ is_read: true, read_at: new Date() }, {
            where: { id, user_id: userId }
        });
    }

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Internal Helper: Send Notification
exports.sendNotificationResult = async ({ user_id, type, title, message, metadata }) => {
    try {
        await Notification.create({
            user_id, type, title, message, metadata
        });
        // In a real app, integrate Socket.IO or Push Notification Service here
        return true;
    } catch (e) {
        console.error('Notification Error:', e);
        return false;
    }
};

// Manual Send (for testing/admin)
exports.sendManualNotification = async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;
        await Notification.create({
            user_id,
            title,
            message,
            type: type || 'SYSTEM'
        });
        res.status(201).json({ success: true, message: 'Notification sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
