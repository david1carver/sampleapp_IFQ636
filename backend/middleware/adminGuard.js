// backend/middleware/adminGuard.js
// Guards admin-only routes. Must be placed AFTER requireAuth in the chain
// so that req.user is already populated from the JWT.

module.exports = function adminGuard(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
};
