// backend/controllers/restaurantController.js
// Thin HTTP layer. All business logic lives in RestaurantService (Facade),
// which composes the Builder, Strategy, and Repository patterns.
// Implements SysML R007–R010, R020–R022.

const restaurantService = require('../services/RestaurantService');
const { sendError } = require('../core/errors');

// GET /api/restaurants?cuisine=&location=&minRating=&q=&sort=&page=&limit=
exports.listRestaurants = async (req, res) => {
  try {
    const result = await restaurantService.list(req.query);
    res.json(result);
  } catch (err) {
    sendError(res, err, 'Failed to list restaurants');
  }
};

// GET /api/restaurants/:slug
exports.getRestaurantBySlug = async (req, res) => {
  try {
    const restaurant = await restaurantService.getBySlug(req.params.slug);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    sendError(res, err, 'Failed to fetch restaurant');
  }
};

// POST /api/restaurants  (admin)
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.create(req.body);
    res.status(201).json(restaurant);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Slug already exists', error: err.message });
    }
    sendError(res, err, 'Failed to create restaurant');
  }
};

// PATCH /api/restaurants/:id  (admin)
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.update(req.params.id, req.body);
    res.json(restaurant);
  } catch (err) {
    sendError(res, err, 'Failed to update restaurant');
  }
};

// DELETE /api/restaurants/:id  (admin) — cascades to reviews
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.remove(req.params.id);
    res.json({ message: 'Restaurant deleted', id: restaurant._id });
  } catch (err) {
    sendError(res, err, 'Failed to delete restaurant');
  }
};
