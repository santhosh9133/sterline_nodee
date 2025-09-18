const Admin = require('../models/admin.model');

// Register new admin
exports.registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, username, email, mobile, profilePic, password, role, permissions, createdBy } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, mobile, and password are required'
      });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }, { mobile }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email, username, or mobile number already exists'
      });
    }

    const adminData = {
      firstName,
      lastName,
      username,
      email,
      mobile,
      profilePic,
      password,
      role: role || 'admin',
      permissions: permissions || ['read', 'write', 'delete'],
      createdBy
    };

    const admin = new Admin(adminData);
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: admin
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    const errRes = { success: false, message: 'Error registering admin' };
    if (error.name === 'ValidationError') {
      errRes.errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json(errRes);
    }
    res.status(500).json({ ...errRes, error: error.message });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const admin = await Admin.findOne({ email, isActive: true });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await admin.updateLastLogin();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          username: admin.username,
          email: admin.email,
          mobile: admin.mobile,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, message: 'Error during login', error: error.message });
  }
};

// Get all admins with filters
exports.getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const admins = await Admin.find(query)
      .select('-password')
      .populate('createdBy', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Admin.countDocuments(query);

    res.json({
      success: true,
      data: admins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Error fetching admins', error: error.message });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'firstName lastName username email');

    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    res.json({ success: true, data: admin });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ success: false, message: 'Error fetching admin', error: error.message });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const updateFields = [
      'firstName', 'lastName', 'username', 'email', 'mobile', 'profilePic', 'role', 'permissions', 'isActive'
    ];

    const updateData = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    res.json({ success: true, message: 'Admin updated successfully', data: admin });
  } catch (error) {
    console.error('Error updating admin:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ success: false, message: 'Error updating admin', error: error.message });
  }
};

// Change admin password
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const isValid = await admin.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Error updating password', error: error.message });
  }
};

// Deactivate admin
exports.deactivateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    res.json({ success: true, message: 'Admin deactivated successfully', data: admin });
  } catch (error) {
    console.error('Error deactivating admin:', error);
    res.status(500).json({ success: false, message: 'Error deactivating admin', error: error.message });
  }
};

// Activate admin
exports.activateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    res.json({ success: true, message: 'Admin activated successfully', data: admin });
  } catch (error) {
    console.error('Error activating admin:', error);
    res.status(500).json({ success: false, message: 'Error activating admin', error: error.message });
  }
};

// Setup super admin (only once)
exports.setupSuperAdmin = async (req, res) => {
  try {
    const { firstName, lastName, mobile, username, email, password } = req.body;

    const superAdmin = await Admin.createSuperAdmin({
      firstName,
      lastName,
      mobile,
      username,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: superAdmin
    });
  } catch (error) {
    console.error('Error creating super admin:', error);
    if (error.message === 'Super admin already exists') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error creating super admin', error: error.message });
  }
};

// Admin statistics overview
exports.getAdminStats = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    const inactiveAdmins = await Admin.countDocuments({ isActive: false });

    const roleStats = await Admin.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentRegistrations = await Admin.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        recentRegistrations,
        roleStats
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching admin statistics', error: error.message });
  }
};
