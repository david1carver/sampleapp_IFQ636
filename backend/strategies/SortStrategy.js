// backend/strategies/SortStrategy.js
// DESIGN PATTERN: Strategy (behavioural).
// Encapsulates interchangeable restaurant-sorting algorithms behind a common
// interface. The query builder/service selects a concrete strategy at runtime
// (from the ?sort= query param) without any conditional logic leaking into the
// caller.
//
// OOP principles demonstrated:
//   - Abstraction: SortStrategy defines the contract (toMongoSort()).
//   - Inheritance: concrete strategies extend the abstract base.
//   - Polymorphism: callers invoke toMongoSort() without knowing the concrete type.

class SortStrategy {
  constructor() {
    if (new.target === SortStrategy) {
      throw new Error('SortStrategy is abstract');
    }
  }

  // Returns a Mongoose sort specification object.
  // eslint-disable-next-line class-methods-use-this
  toMongoSort() {
    throw new Error('toMongoSort() must be implemented by a concrete strategy');
  }
}

class RatingSortStrategy extends SortStrategy {
  toMongoSort() {
    return { averageRating: -1, reviewCount: -1 };
  }
}

class NewestSortStrategy extends SortStrategy {
  toMongoSort() {
    return { createdAt: -1 };
  }
}

class NameSortStrategy extends SortStrategy {
  toMongoSort() {
    return { name: 1 };
  }
}

// Strategy resolver — maps a request param to a concrete strategy instance.
// Defaults to rating sort (the platform's primary discovery order).
function resolveSortStrategy(key) {
  switch ((key || '').toLowerCase()) {
    case 'newest':
      return new NewestSortStrategy();
    case 'name':
      return new NameSortStrategy();
    case 'rating':
    default:
      return new RatingSortStrategy();
  }
}

module.exports = {
  SortStrategy,
  RatingSortStrategy,
  NewestSortStrategy,
  NameSortStrategy,
  resolveSortStrategy,
};
