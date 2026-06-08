// backend/controllers/authController.js
// Thin HTTP layer over AuthService (Facade), which wraps the UserRepository,
// JWT signing, and bcrypt comparison.

const authService = require('../services/AuthService');
const { sendError } = require('../core/errors');

const registerUser = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    sendError(res, err, err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    sendError(res, err, err.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json(profile);
  } catch (err) {
    sendError(res, err, 'Server error');
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    sendError(res, err, err.message);
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
