// backend/controllers/restaurantController.js
// Implements SysML R007 (browse), R008 (list), R009 (search), R010 (detail),
// R020 (create), R021 (update), R022 (delete).

const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

// GET /api/restaurants?cuisine=&location=&minRating=&q=&page=&limit=
// Public. Supports filters and search.
exports.listRestaurants = async (req, res) => {
  try {
    const { cuisine, location, minRating, q } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (cuisine) filter.cuisine = new RegExp(`^${escapeRegex(cuisine)}$`, 'i');
    if (location) filter.location = new RegExp(escapeRegex(location), 'i');
    if (minRating) filter.averageRating = { $gte: Number(minRating) };
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { cuisine: rx }];
    }

    const [items, total] = await Promise.all([
      Restaurant.find(filter).sort({ averageRating: -1, reviewCount: -1 }).skip(skip).limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list restaurants', error: err.message });
  }
};

// GET /api/restaurants/:slug
// Public.
exports.getRestaurantBySlug = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug.toLowerCase() });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch restaurant', error: err.message });
  }
};

// POST /api/restaurants
// Admin only.
exports.createRestaurant = async (req, res) => {
  try {
    const { name, slug, cuisine, location, description, imageUrl } = req.body;
    if (!name || !cuisine || !location) {
      return res.status(400).json({ message: 'name, cuisine, and location are required' });
    }
    const restaurant = await Restaurant.create({
      name,
      slug,
      cuisine,
      location,
      description,
      imageUrl,
    });
    res.status(201).json(restaurant);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Slug already exists', error: err.message });
    }
    res.status(500).json({ message: 'Failed to create restaurant', error: err.message });
  }
};

// PATCH /api/restaurants/:id
// Admin only.
exports.updateRestaurant = async (req, res) => {
  try {
    const updatable = ['name', 'slug', 'cuisine', 'location', 'description', 'imageUrl'];
    const patch = {};
    for (const key of updatable) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update restaurant', error: err.message });
  }
};

// DELETE /api/restaurants/:id
// Admin only. Cascades — removes all reviews for this restaurant.
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    await Review.deleteMany({ restaurantId: restaurant._id });
    res.json({ message: 'Restaurant deleted', id: restaurant._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete restaurant', error: err.message });
  }
};

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
