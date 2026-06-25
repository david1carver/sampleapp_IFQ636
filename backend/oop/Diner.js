// backend/oop/Diner.js
// Concrete user type. Demonstrates INHERITANCE (extends User) and
// POLYMORPHISM (overrides the abstract permissions() with diner-specific rights).

const User = require('./User');

class Diner extends User {
  constructor({ id, name, email }) {
    super({ id, name, email, role: 'diner' });
  }

  // Overrides the abstract base method — a diner may manage their own reviews
  // but cannot touch the restaurant catalogue or moderate other users.
  permissions() {
    return ['review:create', 'review:update:own', 'review:delete:own'];
  }
}

module.exports = Diner;
