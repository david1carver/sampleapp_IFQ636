// backend/repositories/decorators/LoggingRepositoryDecorator.js
// DESIGN PATTERN: Decorator (structural).
// Wraps ANY repository and transparently adds timing/logging around every
// method call WITHOUT modifying the wrapped class. It is implemented with a
// Proxy so that base CRUD methods AND domain-specific methods (findBySlug,
// aggregateRatingFor, findByEmail, findForUser, …) are all forwarded and
// instrumented. Because the proxy exposes the identical interface, the
// decorated object is fully substitutable for the one it wraps (Liskov).
//
// OOP principles demonstrated:
//   - Composition over inheritance (holds and forwards to the inner repo).
//   - Polymorphism: identical interface to the decorated repository.

const logger = require('../../core/Logger');

class LoggingRepositoryDecorator {
  constructor(repository, label) {
    const name = label || repository.constructor.name;

    // Returning a Proxy from the constructor makes `new LoggingRepositoryDecorator(repo)`
    // behave exactly like `repo`, but with logging woven around each method.
    return new Proxy(repository, {
      get(target, prop, receiver) {
        const original = Reflect.get(target, prop, receiver);
        if (typeof original !== 'function') return original;

        return async (...args) => {
          const start = Date.now();
          try {
            const result = await original.apply(target, args);
            logger.info(`${name}.${String(prop)} ok`, { ms: Date.now() - start });
            return result;
          } catch (err) {
            logger.error(`${name}.${String(prop)} failed`, { message: err && err.message });
            throw err;
          }
        };
      },
    });
  }
}

module.exports = LoggingRepositoryDecorator;
