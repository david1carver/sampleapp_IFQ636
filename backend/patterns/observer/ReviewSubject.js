// backend/patterns/observer/ReviewSubject.js
//
// PATTERN: Observer.
// WHY: When a review is created, updated, or deleted, several unrelated things
// must happen: the restaurant's averageRating/reviewCount must be recomputed,
// and the action must be audited. Hard-wiring those calls into every
// controller couples them together. Instead the controllers publish a single
// "review changed" event; observers react independently.
//
// JUSTIFICATION: new reactions (email the owner, invalidate a cache) can be
// added by registering another observer — no controller edits. The aggregate
// recompute that previously lived inline in reviewController is now the
// AggregateObserver, decoupled from the request flow.
//
// OOP: Observer is an ABSTRACT base (update() throws); concrete observers
// OVERRIDE it — POLYMORPHISM over a uniform notify() loop.

const mongoose = require('mongoose');
const Review = require('../../models/Review');
const Restaurant = require('../../models/Restaurant');
const Logger = require('../singleton/Logger');

class Observer {
  // event: { type: 'created'|'updated'|'deleted', restaurantId, reviewId, actorId }
  async update() {
    throw new Error('Observer.update() must be implemented by a subclass');
  }
}

// Recomputes a restaurant's averageRating + reviewCount from its current reviews.
class AggregateObserver extends Observer {
  async update(event) {
    const { restaurantId } = event;
    const result = await Review.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      { $group: { _id: '$restaurantId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const agg = result[0] || { average: 0, count: 0 };
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: Number((agg.average || 0).toFixed(2)),
      reviewCount: agg.count,
    });
  }
}

// Writes an audit-trail entry through the Singleton logger.
class AuditObserver extends Observer {
  async update(event) {
    Logger.getInstance().audit(`review ${event.type}`, {
      restaurantId: event.restaurantId,
      reviewId: event.reviewId,
      actorId: event.actorId,
    });
  }
}

class ReviewSubject {
  #observers;

  constructor() {
    this.#observers = [];
  }

  subscribe(observer) {
    this.#observers.push(observer);
    return this;
  }

  // Notify every observer. Runs them in parallel; one failing observer does
  // not stop the others (errors are logged, not thrown into the request).
  async notify(event) {
    await Promise.all(
      this.#observers.map((o) =>
        Promise.resolve()
          .then(() => o.update(event))
          .catch((err) => Logger.getInstance().error('observer failed', { error: err.message }))
      )
    );
  }
}

// Pre-wired subject used by the controllers: recompute aggregates + audit.
const reviewSubject = new ReviewSubject()
  .subscribe(new AggregateObserver())
  .subscribe(new AuditObserver());

module.exports = {
  Observer,
  AggregateObserver,
  AuditObserver,
  ReviewSubject,
  reviewSubject,
};
