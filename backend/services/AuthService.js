// backend/services/AuthService.js
// DESIGN PATTERN: Facade (structural).
// Hides JWT signing, bcrypt comparison, and the UserRepository behind a small
// authentication API used by authController.

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { BadRequest, Unauthorized, NotFound } = require('../core/errors');
const { userRepo } = require('./container');

class AuthService {
  // eslint-disable-next-line class-methods-use-this
  #signToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  }

  async register({ name, email, password }) {
    const exists = await userRepo.findByEmail(email);
    if (exists) throw BadRequest('User already exists');
    const user = await userRepo.create({ name, email, password });
    return { id: user.id, name: user.name, email: user.email, token: this.#signToken(user.id, user.role) };
  }

  async login({ email, password }) {
    const user = await userRepo.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, name: user.name, email: user.email, token: this.#signToken(user.id, user.role) };
    }
    throw Unauthorized('Invalid email or password');
  }

  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw NotFound('User not found');
    return { name: user.name, email: user.email, university: user.university, address: user.address };
  }

  async updateProfile(userId, body) {
    const user = await userRepo.findById(userId);
    if (!user) throw NotFound('User not found');
    const { name, email, university, address } = body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.university = university || user.university;
    user.address = address || user.address;
    const updated = await user.save();
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      university: updated.university,
      address: updated.address,
      token: this.#signToken(updated.id, updated.role),
    };
  }
}

module.exports = new AuthService();
module.exports.AuthService = AuthService;
