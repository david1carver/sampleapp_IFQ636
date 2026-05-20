// backend/models/Restaurant.js
// Mongoose model for restaurants. Implements SysML R007, R008, R010, R019–R022.

const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    cuisine: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    // Aggregate fields, recomputed on review create/update/delete
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Compound index used by browse-with-filters
restaurantSchema.index({ cuisine: 1, location: 1 });

// Convenience: ensure slug is lowercase if name set without explicit slug
restaurantSchema.pre('validate', function next() {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
