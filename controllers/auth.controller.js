const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Helper function to generate response with token
const generateTokenResponse = (user) => {
    const token = user.generateAuthToken();
    return {
        success: true,
        message: 'Authentication successful',
        token,
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        }
    };
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { userName, email, password, confirmPassword } = req.body;

        // Validation
        if (!userName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { userName: userName }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }
        }

        // Create new user
        const user = new User({
            userName: userName.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        await user.save();

        // Generate token and send response
        const response = generateTokenResponse(user);
        
        res.status(201).json(response);

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Find user by credentials
        const user = await User.findByCredentials(email.toLowerCase(), password);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token and send response
        const response = generateTokenResponse(user);
        
        res.status(200).json(response);

    } catch (error) {
        console.error('Login error:', error);
        
        if (error.message === 'Invalid login credentials') {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = req.user;
        
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { userName } = req.body;
        const userId = req.user._id;

        // Validation
        if (!userName) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }

        // Check if username is already taken by another user
        const existingUser = await User.findOne({
            userName: userName.trim(),
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { userName: userName.trim() },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user._id;

        // Validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password, new password, and confirmation are required'
            });
        }

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        // Validate new password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await User.findById(userId).select('+password');

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
};

// Logout (client-side token removal, but we can track it)
exports.logout = async (req, res) => {
    try {
        // In a more advanced implementation, you might want to blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};