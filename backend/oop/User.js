// backend/oop/User.js
// Abstract base class for the domain user hierarchy.
//
// OOP principles demonstrated here:
//   * ABSTRACTION  — `User` is never instantiated directly. The constructor
//                    throws if you try to `new User(...)`, and `permissions()`
//                    is an abstract method that subclasses MUST override.
//   * ENCAPSULATION — identity fields are stored in private (#) fields and are
//                     only reachable through read-only getters, so external
//                     code cannot mutate a user's id/role after construction.
//   * POLYMORPHISM — `can(action)` is defined once on the base class but its
//                    behaviour changes depending on the subclass's
//                    `permissions()` implementation (see Diner / Admin).

class User {
  // Private fields — true encapsulation (not reachable outside the class).
  #id;
  #name;
  #email;
  #role;

  constructor({ id, name, email, role }) {
    if (new.target === User) {
      throw new Error('User is abstract and cannot be instantiated directly');
    }
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#role = role;
  }

  // Read-only accessors — controlled exposure of encapsulated state.
  get id() { return this.#id; }
  get name() { return this.#name; }
  get email() { return this.#email; }
  get role() { return this.#role; }

  // Abstract method — subclasses must override. Returns the set of actions
  // this user type may perform.
  permissions() {
    throw new Error('permissions() must be implemented by a subclass');
  }

  // Concrete method that relies on the polymorphic permissions().
  // Same call site, different behaviour per subclass.
  can(action) {
    return this.permissions().includes(action);
  }

  // Polymorphism via OVERRIDING is shown in subclasses; here we also show
  // an overloading-style signature: describe() optionally takes a verbosity
  // flag and changes its output shape based on the argument supplied.
  describe(verbose = false) {
    if (verbose) {
      return `${this.#role.toUpperCase()} ${this.#name} <${this.#email}> [${this.permissions().join(', ')}]`;
    }
    return `${this.#name} (${this.#role})`;
  }
}

module.exports = User;
