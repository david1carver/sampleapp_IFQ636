// backend/core/Logger.js
// DESIGN PATTERN: Singleton (creational).
// A single shared Logger instance is used across the whole application so that
// every module writes through the same configured sink and the same in-memory
// audit buffer. The constructor is guarded so that repeated `new Logger()` calls
// (or repeated require()s) always return the one and only instance.
//
// OOP principles demonstrated:
//   - Encapsulation: the log buffer (#buffer) is private; callers interact only
//     through the public info/warn/error/audit methods.

class Logger {
  static #instance = null;

  // Private state — not reachable from outside the class.
  #buffer = [];
  #enabled = true;

  constructor() {
    if (Logger.#instance) {
      return Logger.#instance; // enforce single instance
    }
    Logger.#instance = this;
  }

  // Convenience accessor used by modules that prefer an explicit getter.
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  #write(level, message, meta) {
    const entry = { level, message, meta: meta || null, at: new Date().toISOString() };
    this.#buffer.push(entry);
    if (this.#enabled && process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console[level === 'error' ? 'error' : 'log'](
        `[${entry.at}] ${level.toUpperCase()}: ${message}`,
        meta !== undefined ? meta : ''
      );
    }
    return entry;
  }

  info(message, meta) {
    return this.#write('info', message, meta);
  }

  warn(message, meta) {
    return this.#write('warn', message, meta);
  }

  error(message, meta) {
    return this.#write('error', message, meta);
  }

  // Records an immutable audit trail entry (used by AuditLogObserver).
  audit(action, meta) {
    return this.#write('audit', action, meta);
  }

  // Test/inspection helpers.
  getEntries() {
    return [...this.#buffer];
  }

  clear() {
    this.#buffer = [];
  }
}

// Export the single shared instance (idiomatic Node singleton).
module.exports = Logger.getInstance();
// Also expose the class for tests that need to assert the Singleton contract.
module.exports.Logger = Logger;
