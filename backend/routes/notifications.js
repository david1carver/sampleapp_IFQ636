// backend/routes/notifications.js
// Mount in server.js: app.use('/api/notifications', require('./routes/notifications'));

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/notificationController');
const { protect: requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, ctrl.listMyNotifications);
router.get('/unread/count', requireAuth, ctrl.unreadCount);
router.post('/', requireAuth, ctrl.createNotification);
router.put('/:id/read', requireAuth, ctrl.markRead);

module.exports = router;
