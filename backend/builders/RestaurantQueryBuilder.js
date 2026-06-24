// backend/builders/RestaurantQueryBuilder.js
// DESIGN PATTERN: Builder (creational).
// Constructs the (sometimes complex) restaurant search query — filter + sort +
// pagination — step by step through a fluent interface, instead of assembling a
// large object inline in the controller. Each "with…" step is optional, so the
// same builder serves the no-filter browse case and the fully-filtered search.
//
// Collaborates with the Strategy pattern: the sort step accepts a SortStrategy.
//
// OOP principles demonstrated:
//   - Encapsulation: the partial query state is hidden; only build() exposes it.

const { resolveSortStrategy } = require('../strategies/SortStrategy');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class RestaurantQueryBuilder {
  #filter = {};
  #sort = resolveSortStrategy('rating').toMongoSort();
  #page = 1;
  #limit = 12;

  withCuisine(cuisine) {
    if (cuisine) this.#filter.cuisine = new RegExp(`^${escapeRegex(cuisine)}$`, 'i');
    return this;
  }

  withLocation(location) {
    if (location) this.#filter.location = new RegExp(escapeRegex(location), 'i');
    return this;
  }

  withMinRating(minRating) {
    if (minRating) this.#filter.averageRating = { $gte: Number(minRating) };
    return this;
  }

  withSearch(q) {
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      this.#filter.$or = [{ name: rx }, { description: rx }, { cuisine: rx }];
    }
    return this;
  }

  // Accepts a sort key (string) and resolves it to a Strategy.
  withSort(sortKey) {
    this.#sort = resolveSortStrategy(sortKey).toMongoSort();
    return this;
  }

  withPagination(page, limit) {
    this.#page = Math.max(parseInt(page, 10) || 1, 1);
    this.#limit = Math.min(parseInt(limit, 10) || 12, 50);
    return this;
  }

  // Produces the immutable query descriptor consumed by the repository/service.
  build() {
    return {
      filter: this.#filter,
      sort: this.#sort,
      page: this.#page,
      limit: this.#limit,
      skip: (this.#page - 1) * this.#limit,
    };
  }
}

module.exports = RestaurantQueryBuilder;
