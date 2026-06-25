// backend/patterns/strategy/SortStrategies.js
//
// PATTERN: Strategy.
// WHY: Browse results can be ordered several ways (top rated, most reviewed,
// newest). Rather than littering listRestaurants with if/else branches, each
// ordering is a self-contained strategy object exposing the same apply()
// contract. The controller picks one at runtime from the `?sort=` query param.
//
// JUSTIFICATION: new orderings (e.g. alphabetical) can be added without
// touching the controller — open/closed principle. Each strategy is trivially
// unit-testable in isolation.
//
// OOP: SortStrategy is an ABSTRACT base (apply() throws); concrete strategies
// OVERRIDE it — POLYMORPHISM. The controller depends only on the abstraction.

class SortStrategy {
  // Returns the Mongo sort spec object for Query.sort(...).
  apply() {
    throw new Error('SortStrategy.apply() must be implemented by a subclass');
  }
}

class RatingSortStrategy extends SortStrategy {
  apply() { return { averageRating: -1, reviewCount: -1 }; }
}

class ReviewCountSortStrategy extends SortStrategy {
  apply() { return { reviewCount: -1, averageRating: -1 }; }
}

class NewestSortStrategy extends SortStrategy {
  apply() { return { createdAt: -1 }; }
}

// Maps the public query value -> strategy instance. `rating` is the default,
// preserving the original listRestaurants behaviour for backward compatibility.
const STRATEGIES = {
  rating: new RatingSortStrategy(),
  reviews: new ReviewCountSortStrategy(),
  newest: new NewestSortStrategy(),
};

function getSortStrategy(key) {
  return STRATEGIES[key] || STRATEGIES.rating;
}

module.exports = {
  SortStrategy,
  RatingSortStrategy,
  ReviewCountSortStrategy,
  NewestSortStrategy,
  getSortStrategy,
};
