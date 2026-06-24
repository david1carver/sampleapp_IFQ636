// backend/services/RestaurantService.js
// DESIGN PATTERN: Facade (structural).
// Presents a simple, intention-revealing API (list/getBySlug/create/update/
// remove) to the controllers, hiding the collaboration between the Builder, the
// Strategy, and the Repository behind it.

const RestaurantQueryBuilder = require('../builders/RestaurantQueryBuilder');
const { BadRequest, NotFound } = require('../core/errors');
const { restaurantRepo, reviewRepo } = require('./container');

class RestaurantService {
  // Browse/search with filters, sort strategy, and pagination.
  async list(query = {}) {
    const q = new RestaurantQueryBuilder()
      .withCuisine(query.cuisine)
      .withLocation(query.location)
      .withMinRating(query.minRating)
      .withSearch(query.q)
      .withSort(query.sort)
      .withPagination(query.page, query.limit)
      .build();

    const [items, total] = await Promise.all([
      restaurantRepo.find(q.filter, { sort: q.sort, skip: q.skip, limit: q.limit }),
      restaurantRepo.count(q.filter),
    ]);

    return {
      items,
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit) || 1,
    };
  }

  getBySlug(slug) {
    return restaurantRepo.findBySlug(slug);
  }

  async create(data = {}) {
    const { name, slug, cuisine, location, description, imageUrl } = data;
    if (!name || !cuisine || !location) {
      throw BadRequest('name, cuisine, and location are required');
    }
    return restaurantRepo.create({ name, slug, cuisine, location, description, imageUrl });
  }

  async update(id, body = {}) {
    const updatable = ['name', 'slug', 'cuisine', 'location', 'description', 'imageUrl'];
    const patch = {};
    for (const key of updatable) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    const restaurant = await restaurantRepo.updateById(id, patch);
    if (!restaurant) throw NotFound('Restaurant not found');
    return restaurant;
  }

  // Cascade delete: removing a restaurant removes its reviews.
  async remove(id) {
    const restaurant = await restaurantRepo.deleteById(id);
    if (!restaurant) throw NotFound('Restaurant not found');
    await reviewRepo.deleteMany({ restaurantId: restaurant._id });
    return restaurant;
  }
}

module.exports = new RestaurantService();
module.exports.RestaurantService = RestaurantService;
