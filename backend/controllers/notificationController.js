// backend/controllers/notificationController.js
// Thin HTTP layer over NotificationService. New A2 functionality.

const notificationService = require('../services/NotificationService');
const { sendError } = require('../core/errors');

// GET /api/notifications?unread=true  (auth) — current user's notifications
exports.listMyNotifications = async (req, res) => {
  try {
    const unreadOnly = String(req.query.unread) === 'true';
    const notifications = await notificationService.listForUser(req.user._id, { unreadOnly });
    res.json(notifications);
  } catch (err) {
    sendError(res, err, 'Failed to list notifications');
  }
};

// GET /api/notifications/unread/count  (auth)
exports.unreadCount = async (req, res) => {
  try {
    const count = await notificationService.unreadCount(req.user._id);
    res.json({ count });
  } catch (err) {
    sendError(res, err, 'Failed to count notifications');
  }
};

// POST /api/notifications  (auth) — create a notification. Admins may target
// another user via body.userId; everyone else targets themselves.
exports.createNotification = async (req, res) => {
  try {
    const { message, channel, userId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }
    const targetUserId = req.user.role === 'admin' && userId ? userId : req.user._id;
    const notification = await notificationService.create({
      userId: targetUserId,
      message: message.trim(),
      channel,
    });
    res.status(201).json(notification);
  } catch (err) {
    sendError(res, err, 'Failed to create notification');
  }
};

// PUT /api/notifications/:id/read  (auth) — mark own notification read
exports.markRead = async (req, res) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user._id);
    res.json(notification);
  } catch (err) {
    sendError(res, err, 'Failed to update notification');
  }
};
