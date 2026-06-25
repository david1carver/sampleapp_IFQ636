// backend/patterns/proxy/RestaurantServiceProxy.js
//
// PATTERN: Proxy (protection proxy).
// WHY: Restaurant create/update/delete are admin-only. Rather than scatter
// role checks through the controller, a protection proxy wraps the real
// service and exposes the SAME interface. It verifies the caller's domain
// permissions (from the Factory-built user) before delegating; otherwise it
// denies access. The controller can't accidentally bypass the check because
// the real service is only reachable through the proxy.
//
// JUSTIFICATION: separates authorisation from business logic. The real service
// stays focused on persistence and can be unit-tested without auth; the proxy
// is tested purely for its gatekeeping. Both share one interface, so the
// controller is agnostic to which it holds.

const Restaurant = require('../../models/Restaurant');
const Logger = require('../singleton/Logger');

// The "real subject": does the actual data work, no authorisation concerns.
class RestaurantService {
  async create(data) {
    return Restaurant.create(data);
  }

  async update(id, patch) {
    return Restaurant.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  }

  async delete(id) {
    return Restaurant.findByIdAndDelete(id);
  }
}

// Sentinel returned when the caller lacks permission.
class AccessDeniedError extends Error {
  constructor(action) {
    super(`Access denied for action "${action}"`);
    this.name = 'AccessDeniedError';
    this.status = 403;
  }
}

// The proxy: same interface as RestaurantService, plus a permission gate.
class RestaurantServiceProxy {
  #real;
  #user; // a domain User (Diner/Admin) built by UserFactory

  constructor(user, realService = new RestaurantService()) {
    this.#user = user;
    this.#real = realService;
  }

  #authorise(action) {
    if (!this.#user || !this.#user.can(action)) {
      Logger.getInstance().audit('access denied', {
        action,
        actorId: this.#user && this.#user.id,
      });
      throw new AccessDeniedError(action);
    }
  }

  async create(data) {
    this.#authorise('restaurant:create');
    return this.#real.create(data);
  }

  async update(id, patch) {
    this.#authorise('restaurant:update');
    return this.#real.update(id, patch);
  }

  async delete(id) {
    this.#authorise('restaurant:delete');
    return this.#real.delete(id);
  }
}

module.exports = { RestaurantService, RestaurantServiceProxy, AccessDeniedError };
