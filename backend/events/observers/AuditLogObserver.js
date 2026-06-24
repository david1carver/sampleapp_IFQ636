// backend/events/observers/AuditLogObserver.js
// Concrete Observer: writes an immutable audit-trail entry for every review
// event via the Logger Singleton. Purely cross-cutting; never touches the DB.

const Observer = require('./Observer');
const logger = require('../../core/Logger');

class AuditLogObserver extends Observer {
  // eslint-disable-next-line class-methods-use-this
  async update(event) {
    logger.audit(event.type, {
      reviewId: event.reviewId,
      restaurantId: event.restaurantId,
      actorId: event.actorId,
    });
  }
}

module.exports = AuditLogObserver;
