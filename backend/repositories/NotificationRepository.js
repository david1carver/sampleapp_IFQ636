// backend/repositories/NotificationRepository.js
// Concrete Repository for Notification documents (extends BaseRepository).

const BaseRepository = require('./BaseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findForUser(userId, { unreadOnly = false } = {}) {
    const filter = { userId };
    if (unreadOnly) filter.read = false;
    return this.find(filter, { sort: { createdAt: -1 } });
  }
}

module.exports = NotificationRepository;
