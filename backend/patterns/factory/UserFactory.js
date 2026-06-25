// backend/patterns/factory/UserFactory.js
//
// PATTERN: Factory.
// WHY: The auth layer holds a plain Mongoose user document with a `role`
// string. The rest of the app wants a rich domain object (Diner / Admin) with
// behaviour (permissions(), canModerate()). The Factory centralises the
// role -> concrete-class decision in ONE place so controllers never branch on
// the role string themselves.
//
// JUSTIFICATION: adding a new role later (e.g. 'owner') means changing exactly
// one switch here, not hunting through controllers. It also keeps the
// construction logic (mapping a DB document's fields onto the class) in a
// single, testable spot.

const Diner = require('../../oop/Diner');
const Admin = require('../../oop/Admin');

class UserFactory {
  // Build the correct domain user from a role + identity fields.
  static create({ id, name, email, role }) {
    switch (role) {
      case 'admin':
        return new Admin({ id, name, email });
      case 'diner':
        return new Diner({ id, name, email });
      default:
        throw new Error(`UserFactory: unknown role "${role}"`);
    }
  }

  // Convenience adapter from a Mongoose user document / req.user shape.
  static fromDocument(doc) {
    if (!doc) throw new Error('UserFactory.fromDocument: no document supplied');
    return UserFactory.create({
      id: (doc._id || doc.id || '').toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
    });
  }
}

module.exports = UserFactory;
