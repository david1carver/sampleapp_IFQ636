// backend/oop/Admin.js
// Concrete user type. Demonstrates INHERITANCE and POLYMORPHISM:
//   * overrides permissions() with the full admin rights set
//   * adds a behaviour (canModerate) that does not exist on the base class

const User = require('./User');

class Admin extends User {
  constructor({ id, name, email }) {
    super({ id, name, email, role: 'admin' });
  }

  // Overrides the abstract base method with the superset of rights an admin holds.
  permissions() {
    return [
      'restaurant:create',
      'restaurant:update',
      'restaurant:delete',
      'review:delete:any',
      'review:respond',
      'review:moderate',
    ];
  }

  // Admin-specific behaviour, absent from Diner — clients can branch on this
  // without type-checking, e.g. `if (typeof user.canModerate === 'function')`.
  canModerate() {
    return true;
  }
}

module.exports = Admin;
