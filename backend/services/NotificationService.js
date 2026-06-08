// backend/services/NotificationService.js
// DESIGN PATTERN: Facade (structural) over the NotificationRepository +
// NotificationFactory. Powers the new /api/notifications endpoints (A2 feature).

const NotificationFactory = require('../factories/NotificationFactory');
const { NotFound, Forbidden } = require('../core/errors');
const { notificationRepo } = require('./container');

class NotificationService {
  listForUser(userId, { unreadOnly = false } = {}) {
    return notificationRepo.findForUser(userId, { unreadOnly });
  }

  unreadCount(userId) {
    return notificationRepo.count({ userId, read: false });
  }

  // Creates a SYSTEM notification (Factory Method builds the payload).
  create({ userId, message, channel }) {
    const payload = NotificationFactory.system(userId, message, channel);
    return notificationRepo.create(payload);
  }

  async markRead(id, userId) {
    const notification = await notificationRepo.findById(id);
    if (!notification) throw NotFound('Notification not found');
    if (notification.userId.toString() !== userId.toString()) {
      throw Forbidden('Not your notification');
    }
    return notificationRepo.updateById(id, { read: true });
  }
}

module.exports = new NotificationService();
module.exports.NotificationService = NotificationService;
