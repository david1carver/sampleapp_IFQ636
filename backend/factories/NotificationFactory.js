// backend/factories/NotificationFactory.js
// DESIGN PATTERN: Factory Method (creational).
// Centralises the construction of notification payloads. Each notification
// "type" is produced by its own factory method, so callers ask for a kind of
// notification by intent (e.g. ownerResponse()) rather than hand-assembling the
// fields. New notification types are added in one place.
//
// The factory returns plain payload objects (the products); they are persisted
// by the NotificationRepository. Different channels (inapp/email) are modelled
// as polymorphic product variants.
//
// OOP principles demonstrated:
//   - Abstraction: callers depend on intent-named methods, not on the schema.
//   - Polymorphism: every method returns the same Notification product shape.

class NotificationFactory {
  static reviewCreated(userId, restaurantName) {
    return {
      userId,
      type: 'REVIEW_CREATED',
      channel: 'inapp',
      message: `Your review of ${restaurantName} was published.`,
    };
  }

  static ownerResponse(userId, restaurantName) {
    return {
      userId,
      type: 'OWNER_RESPONSE',
      channel: 'inapp',
      message: `${restaurantName} responded to your review.`,
    };
  }

  static reviewRemoved(userId, restaurantName) {
    return {
      userId,
      type: 'REVIEW_REMOVED',
      channel: 'inapp',
      message: `Your review of ${restaurantName} was removed by a moderator.`,
    };
  }

  static system(userId, message, channel = 'inapp') {
    return { userId, type: 'SYSTEM', channel, message };
  }

  // Generic factory method dispatching on a kind string (Factory Method core).
  static create(kind, payload = {}) {
    switch (kind) {
      case 'REVIEW_CREATED':
        return NotificationFactory.reviewCreated(payload.userId, payload.restaurantName);
      case 'OWNER_RESPONSE':
        return NotificationFactory.ownerResponse(payload.userId, payload.restaurantName);
      case 'REVIEW_REMOVED':
        return NotificationFactory.reviewRemoved(payload.userId, payload.restaurantName);
      case 'SYSTEM':
        return NotificationFactory.system(payload.userId, payload.message, payload.channel);
      default:
        throw new Error(`Unknown notification kind: ${kind}`);
    }
  }
}

module.exports = NotificationFactory;
