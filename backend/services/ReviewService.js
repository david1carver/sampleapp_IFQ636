// backend/services/ReviewService.js
// DESIGN PATTERN: Facade (structural) + orchestrates the Observer subject.
// Controllers call these intention-revealing methods; the service coordinates
// the repositories and raises domain events so the attached observers
// (rating recompute, notifications, audit) run without the controller knowing.

const { BadRequest, NotFound, Forbidden } = require('../core/errors');
const { ReviewEvents } = require('../events/ReviewSubject');
const { reviewRepo, restaurantRepo, reviewSubject } = require('./container');

class ReviewService {
  listForRestaurant(restaurantId) {
    return reviewRepo.find(
      { restaurantId },
      { populate: [{ path: 'userId', select: 'name email' }], sort: { createdAt: -1 } }
    );
  }

  listMine(userId) {
    return reviewRepo.find(
      { userId },
      { populate: [{ path: 'restaurantId', select: 'name slug imageUrl' }], sort: { createdAt: -1 } }
    );
  }

  async listAll(query = {}) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 50, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      reviewRepo.find(
        {},
        {
          populate: [
            { path: 'restaurantId', select: 'name slug' },
            { path: 'userId', select: 'name email' },
          ],
          sort: { createdAt: -1 },
          skip,
          limit,
        }
      ),
      reviewRepo.count({}),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
  }

  async create({ restaurantId, userId, rating, text }) {
    if (!rating || !text) throw BadRequest('rating and text are required');
    if (rating < 1 || rating > 5) throw BadRequest('rating must be 1–5');

    const restaurant = await restaurantRepo.findById(restaurantId);
    if (!restaurant) throw NotFound('Restaurant not found');

    const review = await reviewRepo.create({ restaurantId: restaurant._id, userId, rating, text });

    await reviewSubject.notify({
      type: ReviewEvents.CREATED,
      reviewId: review._id,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      recipientId: userId,
      actorId: userId,
    });

    return review;
  }

  async update({ reviewId, userId, rating, text }) {
    const review = await reviewRepo.findById(reviewId);
    if (!review) throw NotFound('Review not found');
    if (review.userId.toString() !== userId.toString()) {
      throw Forbidden('You can only edit your own reviews');
    }
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) throw BadRequest('rating must be 1–5');
      review.rating = rating;
    }
    if (text !== undefined) review.text = text;
    await review.save();

    await reviewSubject.notify({
      type: ReviewEvents.UPDATED,
      reviewId: review._id,
      restaurantId: review.restaurantId,
      actorId: userId,
    });

    return review;
  }

  async remove({ reviewId, user }) {
    const review = await reviewRepo.findById(reviewId);
    if (!review) throw NotFound('Review not found');

    const isAuthor = review.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isAuthor && !isAdmin) throw Forbidden('Not authorised to delete this review');

    const restaurantId = review.restaurantId;
    const authorId = review.userId;
    await review.deleteOne();

    const restaurant = await restaurantRepo.findById(restaurantId);
    await reviewSubject.notify({
      type: ReviewEvents.DELETED,
      reviewId: review._id,
      restaurantId,
      restaurantName: restaurant ? restaurant.name : 'a restaurant',
      // Notify the author only when an admin (not the author) removed it.
      recipientId: isAdmin && !isAuthor ? authorId : null,
      actorId: user._id,
    });

    return review;
  }

  async respond({ reviewId, response }) {
    if (!response || !response.trim()) throw BadRequest('response text is required');
    const review = await reviewRepo.updateById(reviewId, {
      ownerResponse: response.trim(),
      ownerResponseAt: new Date(),
    });
    if (!review) throw NotFound('Review not found');

    const restaurant = await restaurantRepo.findById(review.restaurantId);
    await reviewSubject.notify({
      type: ReviewEvents.RESPONDED,
      reviewId: review._id,
      restaurantId: review.restaurantId,
      restaurantName: restaurant ? restaurant.name : 'a restaurant',
      recipientId: review.userId,
      actorId: null,
    });

    return review;
  }
}

module.exports = new ReviewService();
module.exports.ReviewService = ReviewService;
