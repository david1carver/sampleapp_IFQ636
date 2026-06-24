// backend/repositories/RestaurantRepository.js
// Concrete Repository for Restaurant documents (extends BaseRepository).

const BaseRepository = require('./BaseRepository');
const Restaurant = require('../models/Restaurant');

class RestaurantRepository extends BaseRepository {
  constructor() {
    super(Restaurant);
  }

  async findBySlug(slug) {
    return this.findOne({ slug: String(slug).toLowerCase() });
  }
}

module.exports = RestaurantRepository;
