// backend/patterns/singleton/Logger.js
//
// PATTERN: Singleton.
// WHY: The application needs exactly one logging/audit sink shared across the
// whole process (observers, facade, proxy all write to it). A Singleton
// guarantees a single instance and a single in-memory audit buffer, so callers
// never accidentally create competing loggers with fragmented history.
//
// JUSTIFICATION: logging is a classic cross-cutting concern. Passing a logger
// through every constructor would be noise; a Singleton gives one global,
// lazily-created access point while still being unit-testable (the buffer can
// be inspected and cleared between tests).

class Logger {
  // Holds the one and only instance.
  static #instance = null;

  #entries;

  constructor() {
    if (Logger.#instance) {
      // Enforce the invariant even if someone calls `new Logger()` directly.
      return Logger.#instance;
    }
    this.#entries = [];
    Logger.#instance = this;
  }

  // The canonical accessor.
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  log(level, message, meta = {}) {
    const entry = { level, message, meta, at: new Date().toISOString() };
    this.#entries.push(entry);
    // Keep console output quiet during tests; surface only in non-test runs.
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`[${entry.at}] ${level.toUpperCase()}: ${message}`);
    }
    return entry;
  }

  info(message, meta) { return this.log('info', message, meta); }
  audit(message, meta) { return this.log('audit', message, meta); }
  error(message, meta) { return this.log('error', message, meta); }

  // Exposed for assertions in unit tests.
  get entries() { return [...this.#entries]; }
  clear() { this.#entries = []; }
}

module.exports = Logger;
