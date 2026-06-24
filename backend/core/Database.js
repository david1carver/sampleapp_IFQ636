// backend/core/Database.js
// DESIGN PATTERN: Singleton (creational).
// Wraps the Mongoose connection so the whole app shares exactly one connection
// object. Calling connect() more than once is a no-op once connected, which
// prevents accidental connection storms (e.g. from tests or hot reloads).
//
// OOP principles demonstrated:
//   - Encapsulation: connection state (#connected) is private.
//   - Abstraction: callers depend on connect()/isConnected(), not on Mongoose details.

const mongoose = require('mongoose');
const logger = require('./Logger');

class Database {
  static #instance = null;

  #connected = false;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }
    Database.#instance = this;
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  isConnected() {
    return this.#connected;
  }

  async connect(uri = process.env.MONGO_URI) {
    if (this.#connected) {
      return mongoose.connection; // already connected — reuse the single connection
    }
    try {
      await mongoose.connect(uri);
      this.#connected = true;
      logger.info('MongoDB connected successfully');
      return mongoose.connection;
    } catch (error) {
      logger.error('MongoDB connection error', { message: error.message });
      process.exit(1);
    }
  }

  async disconnect() {
    if (!this.#connected) return;
    await mongoose.disconnect();
    this.#connected = false;
  }
}

module.exports = Database.getInstance();
module.exports.Database = Database;
