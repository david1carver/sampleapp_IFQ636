// backend/repositories/UserRepository.js
// Concrete Repository for User documents (extends BaseRepository).

const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }
}

module.exports = UserRepository;
