// backend/events/observers/RatingRecalculationObserver.js
// Concrete Observer: on any review mutation, recompute the parent restaurant's
// averageRating + reviewCount from the current review set. This is the critical
// data-integrity observer (replaces the old recomputeAggregates() helper).

const Observer = require('./Observer');

class RatingRecalculationObserver extends Observer {
  #reviewRepo;
  #restaurantRepo;

  constructor(reviewRepo, restaurantRepo) {
    super();
    this.#reviewRepo = reviewRepo;
    this.#restaurantRepo = restaurantRepo;
  }

  async update(event) {
    const restaurantId = event && event.restaurantId;
    if (!restaurantId) return;
    const agg = await this.#reviewRepo.aggregateRatingFor(restaurantId);
    await this.#restaurantRepo.updateById(restaurantId, {
      averageRating: Number((agg.average || 0).toFixed(2)),
      reviewCount: agg.count,
    });
  }
}

module.exports = RatingRecalculationObserver;
