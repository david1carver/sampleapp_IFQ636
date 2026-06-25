// backend/controllers/reviewController.js
// Implements SysML R011–R015 (review CRUD + ownership), R017–R018 (owner response),
// R024 (admin removal of inappropriate reviews).
//
// Design patterns wired in here:
//   * Chain of Responsibility — input validation pipeline for createReview
//   * Observer                — review create/update/delete publish to a subject
//                               whose observers recompute aggregates + audit
//   * Facade                  — admin moderation (list all, respond) goes
//                               through ModerationFacade

const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { reviewSubject } = require('../patterns/observer/ReviewSubject');
const { buildReviewValidationChain } = require('../patterns/chain/ReviewValidation');
const ModerationFacade = require('../patterns/facade/ModerationFacade');

const reviewValidation = buildReviewValidationChain();
const moderation = new ModerationFacade();

// GET /api/restaurants/:id/reviews
// Public.
exports.listReviewsForRestaurant = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list reviews', error: err.message });
  }
};

// GET /api/me/reviews
// Authenticated. The diner's own reviews (Diner Dashboard).
exports.listMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('restaurantId', 'name slug imageUrl')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list your reviews', error: err.message });
  }
};

// POST /api/restaurants/:id/reviews
// Authenticated.
exports.createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;

    // CHAIN OF RESPONSIBILITY: run the input through the validator chain.
    const verdict = reviewValidation.handle({ rating, text });
    if (!verdict.ok) return res.status(verdict.status).json({ message: verdict.message });

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const review = await Review.create({
      restaurantId: restaurant._id,
      userId: req.user._id,
      rating,
      text,
    });

    // OBSERVER: notify subscribers (recompute aggregates + audit).
    await reviewSubject.notify({
      type: 'created',
      restaurantId: restaurant._id,
      reviewId: review._id,
      actorId: req.user._id,
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this restaurant' });
    }
    res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
};

// PATCH /api/reviews/:id
// Authenticated. Author only.
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    const { rating, text } = req.body;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) return res.status(400).json({ message: 'rating must be 1–5' });
      review.rating = rating;
    }
    if (text !== undefined) review.text = text;
    await review.save();

    // OBSERVER: notify subscribers (recompute aggregates + audit).
    await reviewSubject.notify({
      type: 'updated',
      restaurantId: review.restaurantId,
      reviewId: review._id,
      actorId: req.user._id,
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update review', error: err.message });
  }
};

// DELETE /api/reviews/:id
// Authenticated. Author OR admin.
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isAuthor = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorised to delete this review' });
    }

    const restaurantId = review.restaurantId;
    await review.deleteOne();

    // OBSERVER: notify subscribers (recompute aggregates + audit).
    await reviewSubject.notify({
      type: 'deleted',
      restaurantId,
      reviewId: review._id,
      actorId: req.user._id,
    });

    res.json({ message: 'Review deleted', id: review._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};

// POST /api/reviews/:id/response
// Admin only (acting as restaurant owner in this assignment scope).
exports.respondToReview = async (req, res) => {
  try {
    // FACADE: delegate the owner-response workflow.
    const result = await moderation.respond(req.params.id, req.body.response);
    if (!result.ok) return res.status(result.status).json({ message: result.message });
    res.json(result.review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post response', error: err.message });
  }
};

// GET /api/reviews
// Admin only. Returns ALL reviews across all restaurants, paginated, with
// restaurant info and author info populated for the moderation table.
exports.listAllReviews = async (req, res) => {
  try {
    // FACADE: delegate the moderation listing.
    const payload = await moderation.listAllReviews({
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list reviews', error: err.message });
  }
};
