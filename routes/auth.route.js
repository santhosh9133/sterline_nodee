const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { userName, email, password, confirmPassword }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', authController.login);

// Protected routes (authentication required)

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get('/profile', auth, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { userName }
 */
router.put('/profile', auth, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @body    { currentPassword, newPassword, confirmNewPassword }
 */
router.put('/change-password', auth, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should remove token)
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.post('/logout', auth, authController.logout);

module.exports = router;