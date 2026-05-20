// backend/controllers/reviewController.js
// Implements SysML R011–R015 (review CRUD + ownership), R017–R018 (owner response),
// R024 (admin removal of inappropriate reviews).

const mongoose = require('mongoose');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// Recompute the restaurant's averageRating + reviewCount from current reviews.
// Called after any review create/update/delete.
async function recomputeAggregates(restaurantId) {
  const result = await Review.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: '$restaurantId',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  const agg = result[0] || { average: 0, count: 0 };
  await Restaurant.findByIdAndUpdate(restaurantId, {
    averageRating: Number((agg.average || 0).toFixed(2)),
    reviewCount: agg.count,
  });
}

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
    if (!rating || !text) return res.status(400).json({ message: 'rating and text are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'rating must be 1–5' });

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const review = await Review.create({
      restaurantId: restaurant._id,
      userId: req.user._id,
      rating,
      text,
    });
    await recomputeAggregates(restaurant._id);
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
    await recomputeAggregates(review.restaurantId);
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
    await recomputeAggregates(restaurantId);
    res.json({ message: 'Review deleted', id: review._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};

// POST /api/reviews/:id/response
// Admin only (acting as restaurant owner in this assignment scope).
exports.respondToReview = async (req, res) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      return res.status(400).json({ message: 'response text is required' });
    }
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { ownerResponse: response.trim(), ownerResponseAt: new Date() },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post response', error: err.message });
  }
};
