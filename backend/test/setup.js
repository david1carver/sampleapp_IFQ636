// backend/test/setup.js
// Mocha root setup (loaded via .mocharc.json "require"). Runs before any test.
// Keeps unit tests hermetic: no DB connection, no console noise from the Logger.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Disable Mongoose command buffering so any accidental un-stubbed model call in
// a unit test fails fast instead of hanging for the default 10s buffer timeout.
const mongoose = require('mongoose');
mongoose.set('bufferTimeoutMS', 1000);
