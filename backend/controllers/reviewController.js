// backend/controllers/reviewController.js
// Thin HTTP layer. Business logic + side-effects (rating recompute,
// notifications, audit) are handled by ReviewService (Facade) and its attached
// Observers. Implements SysML R011–R015, R017–R018, R024.

const reviewService = require('../services/ReviewService');
const { sendError } = require('../core/errors');

// GET /api/restaurants/:id/reviews  (public)
exports.listReviewsForRestaurant = async (req, res) => {
  try {
    const reviews = await reviewService.listForRestaurant(req.params.id);
    res.json(reviews);
  } catch (err) {
    sendError(res, err, 'Failed to list reviews');
  }
};

// GET /api/reviews/me  (auth) — diner dashboard
exports.listMyReviews = async (req, res) => {
  try {
    const reviews = await reviewService.listMine(req.user._id);
    res.json(reviews);
  } catch (err) {
    sendError(res, err, 'Failed to list your reviews');
  }
};

// POST /api/restaurants/:id/reviews  (auth)
exports.createReview = async (req, res) => {
  try {
    const review = await reviewService.create({
      restaurantId: req.params.id,
      userId: req.user._id,
      rating: req.body.rating,
      text: req.body.text,
    });
    res.status(201).json(review);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this restaurant' });
    }
    sendError(res, err, 'Failed to create review');
  }
};

// PATCH /api/reviews/:id  (auth, author only)
exports.updateReview = async (req, res) => {
  try {
    const review = await reviewService.update({
      reviewId: req.params.id,
      userId: req.user._id,
      rating: req.body.rating,
      text: req.body.text,
    });
    res.json(review);
  } catch (err) {
    sendError(res, err, 'Failed to update review');
  }
};

// DELETE /api/reviews/:id  (auth, author or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await reviewService.remove({ reviewId: req.params.id, user: req.user });
    res.json({ message: 'Review deleted', id: review._id });
  } catch (err) {
    sendError(res, err, 'Failed to delete review');
  }
};

// POST /api/reviews/:id/response  (admin)
exports.respondToReview = async (req, res) => {
  try {
    const review = await reviewService.respond({
      reviewId: req.params.id,
      response: req.body.response,
    });
    res.json(review);
  } catch (err) {
    sendError(res, err, 'Failed to post response');
  }
};

// GET /api/reviews  (admin) — moderation table
exports.listAllReviews = async (req, res) => {
  try {
    const result = await reviewService.listAll(req.query);
    res.json(result);
  } catch (err) {
    sendError(res, err, 'Failed to list reviews');
  }
};
