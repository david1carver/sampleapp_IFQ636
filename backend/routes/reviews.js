// backend/routes/reviews.js
// Review routes. Mount in server.js with:
//   app.use('/api/reviews', require('./routes/reviews'));
//   app.use('/api/me/reviews', require('./routes/myReviews'));   // optional, or fold into here

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/reviewController');
const { protect: requireAuth } = require('../middleware/authMiddleware');
const adminGuard = require('../middleware/adminGuard');

// Diner dashboard — own reviews
// Mount this as a separate router OR add the prefix '/me' here.
router.get('/me', requireAuth, ctrl.listMyReviews);

// Author edits / deletes; admin can also delete
router.patch('/:id', requireAuth, ctrl.updateReview);
router.delete('/:id', requireAuth, ctrl.deleteReview);

// Owner response (admin only in this scope — R017/R018)
router.post('/:id/response', requireAuth, adminGuard, ctrl.respondToReview);

module.exports = router;
