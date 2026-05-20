// backend/models/Review.js
// Mongoose model for reviews. Implements SysML R011–R015, R017, R018, R024.

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    ownerResponse: { type: String, default: null, maxlength: 2000 },
    ownerResponseAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One review per user per restaurant (enforced by index, surfaces clean 11000 error)
reviewSchema.index({ restaurantId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
