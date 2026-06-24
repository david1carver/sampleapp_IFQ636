// backend/repositories/ReviewRepository.js
// Concrete Repository for Review documents (extends BaseRepository).
// Adds the rating aggregation used to recompute a restaurant's averageRating.

const mongoose = require('mongoose');
const BaseRepository = require('./BaseRepository');
const Review = require('../models/Review');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  // Returns { average, count } for a restaurant using a $group aggregation.
  async aggregateRatingFor(restaurantId) {
    const result = await this.model.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      { $group: { _id: '$restaurantId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return result[0] || { average: 0, count: 0 };
  }
}

module.exports = ReviewRepository;
