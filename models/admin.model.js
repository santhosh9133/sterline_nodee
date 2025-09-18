// models/admin.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  profilePic: {
    type: String,
    default: null,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        return hasUpperCase && hasNumber && hasSymbol;
      },
      message: 'Password must contain at least one uppercase letter, one number, and one symbol'
    }
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'hr_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  permissions: {
    type: [String],
    default: ['read', 'write', 'delete']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ createdAt: -1 });

// Pre-save password hash
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

adminSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static methods
adminSchema.statics.findActiveAdmins = function() {
  return this.find({ isActive: true });
};

adminSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

adminSchema.statics.createSuperAdmin = async function(adminData) {
  const existingSuperAdmin = await this.findOne({ role: 'super_admin' });
  if (existingSuperAdmin) {
    throw new Error('Super admin already exists');
  }

  const superAdmin = new this({
    ...adminData,
    role: 'super_admin',
    permissions: ['read', 'write', 'delete', 'manage_admins', 'system_config']
  });

  return superAdmin.save();
};

// Virtuals
adminSchema.virtual('displayName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
