// config/db.js
// Thin backward-compatible wrapper that delegates to the Database Singleton
// (see core/Database.js). server.js continues to `require('./config/db')` and
// call connectDB(), but the actual connection is now managed by the singleton,
// guaranteeing exactly one Mongoose connection for the whole process.

const database = require('../core/Database');

const connectDB = async () => {
  await database.connect(process.env.MONGO_URI);
};

module.exports = connectDB;
