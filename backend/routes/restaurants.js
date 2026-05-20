// backend/routes/restaurants.js
// Restaurant routes. Mount in server.js with: app.use('/api/restaurants', require('./routes/restaurants'));

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/restaurantController');
const reviewCtrl = require('../controllers/reviewController');

// ============================================================
// Adjust these requires to match the starter's actual paths.
// The starter's auth middleware is typically at:
//   ../middleware/auth.js   (decorates req.user from JWT)
// And the admin guard is added by us, at:
//   ../middleware/adminGuard.js
// ============================================================
const { protect: requireAuth } = require('../middleware/authMiddleware');
const adminGuard = require('../middleware/adminGuard');

// Public
router.get('/', ctrl.listRestaurants);
router.get('/:slug', ctrl.getRestaurantBySlug);

// Reviews under a restaurant (public read, auth-required create)
router.get('/:id/reviews', reviewCtrl.listReviewsForRestaurant);
router.post('/:id/reviews', requireAuth, reviewCtrl.createReview);

// Admin CRUD
router.post('/', requireAuth, adminGuard, ctrl.createRestaurant);
router.patch('/:id', requireAuth, adminGuard, ctrl.updateRestaurant);
router.delete('/:id', requireAuth, adminGuard, ctrl.deleteRestaurant);

module.exports = router;
