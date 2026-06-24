// backend/events/ReviewSubject.js
// DESIGN PATTERN: Observer (behavioural) — the Subject.
// When a review is created, updated, deleted, or responded to, the subject
// notifies all attached observers. Observers are decoupled from one another and
// from the service that raises the event: new side-effects (analytics, email,
// search re-indexing) can be added by attaching another observer — the service
// code does not change (Open/Closed Principle).
//
// Each observer is invoked defensively: a failing non-critical observer (e.g.
// notification delivery) is logged but never breaks the request flow.
//
// OOP principles demonstrated:
//   - Encapsulation: the observer list (#observers) is private.
//   - Polymorphism: every observer is invoked through the same update() contract.

const logger = require('../core/Logger');

const ReviewEvents = Object.freeze({
  CREATED: 'REVIEW_CREATED',
  UPDATED: 'REVIEW_UPDATED',
  DELETED: 'REVIEW_DELETED',
  RESPONDED: 'OWNER_RESPONSE',
});

class ReviewSubject {
  #observers = [];

  subscribe(observer) {
    this.#observers.push(observer);
    return this; // fluent attach
  }

  unsubscribe(observer) {
    this.#observers = this.#observers.filter((o) => o !== observer);
    return this;
  }

  // Notifies every observer. Each observer is isolated so one failure does not
  // cascade. Returns once all observers have settled.
  async notify(event) {
    await Promise.all(
      this.#observers.map(async (observer) => {
        try {
          await observer.update(event);
        } catch (err) {
          logger.error('Observer failed', {
            observer: observer.constructor.name,
            type: event && event.type,
            message: err.message,
          });
        }
      })
    );
  }
}

module.exports = { ReviewSubject, ReviewEvents };
