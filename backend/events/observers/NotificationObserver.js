// backend/events/observers/NotificationObserver.js
// Concrete Observer: turns review events into persisted notifications using the
// NotificationFactory (Factory Method) + NotificationRepository (Repository).
// Non-critical: failures here are caught by the Subject and never break the
// originating request.

const Observer = require('./Observer');
const NotificationFactory = require('../../factories/NotificationFactory');
const { ReviewEvents } = require('../ReviewSubject');

class NotificationObserver extends Observer {
  #notificationRepo;

  constructor(notificationRepo) {
    super();
    this.#notificationRepo = notificationRepo;
  }

  async update(event) {
    if (!event || !event.recipientId) return;

    let payload;
    switch (event.type) {
      case ReviewEvents.CREATED:
        payload = NotificationFactory.reviewCreated(event.recipientId, event.restaurantName);
        break;
      case ReviewEvents.RESPONDED:
        payload = NotificationFactory.ownerResponse(event.recipientId, event.restaurantName);
        break;
      case ReviewEvents.DELETED:
        payload = NotificationFactory.reviewRemoved(event.recipientId, event.restaurantName);
        break;
      default:
        return; // UPDATED produces no notification
    }
    await this.#notificationRepo.create(payload);
  }
}

module.exports = NotificationObserver;
