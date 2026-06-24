// backend/core/errors.js
// A small typed-exception hierarchy so the service layer can signal HTTP
// outcomes without importing Express, and controllers can map them uniformly.
//
// OOP principles demonstrated:
//   - Inheritance: every error extends the native Error / AppError base.

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

const BadRequest = (m) => new AppError(m, 400);
const Unauthorized = (m) => new AppError(m, 401);
const Forbidden = (m) => new AppError(m, 403);
const NotFound = (m) => new AppError(m, 404);
const Conflict = (m) => new AppError(m, 409);

// Uniform error responder used by every controller's catch block.
function sendError(res, err, fallback = 'Server error') {
  if (err && err.code === 11000) {
    return res.status(409).json({ message: err.message || 'Duplicate key', error: err.message });
  }
  if (err && err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  return res.status(500).json({ message: fallback, error: err && err.message });
}

module.exports = { AppError, BadRequest, Unauthorized, Forbidden, NotFound, Conflict, sendError };
