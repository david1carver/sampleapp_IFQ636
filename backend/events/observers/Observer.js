// backend/events/observers/Observer.js
// DESIGN PATTERN: Observer (behavioural) — the abstract Observer contract.
// Concrete observers implement update(event) and are attached to a Subject.

class Observer {
  constructor() {
    if (new.target === Observer) {
      throw new Error('Observer is abstract');
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async update(event) {
    throw new Error('update(event) must be implemented by a concrete observer');
  }
}

module.exports = Observer;
