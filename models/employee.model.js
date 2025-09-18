const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  profilePhoto: {
    type: String, // store image URL or path
    default: null,
  },

  // Basic Information
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  empCode: { type: String, required: true, unique: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  joiningDate: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  nationality: { type: String, required: true },
  shift: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  about: { type: String, maxlength: 60 },

  // Address Information
  address: { type: String, trim: true },
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  city: { type: String, trim: true },
  zipcode: { type: String, trim: true },

  // Emergency Information
  emergencyContacts: [
    {
      contactNumber: { type: String, required: true, trim: true },
      relation: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true },
    },
  ],

  // Bank Information
  bank: {
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifsc: { type: String, trim: true },
    branch: { type: String, trim: true },
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password) {
        // Check for at least one uppercase letter, one number, and one symbol
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        return hasUpperCase && hasNumber && hasSymbol;
      },
      message: 'Password must contain at least one uppercase letter, one number, and one symbol'
    }
  },

  // Additional fields for employee management
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password; // Remove password from JSON output
      return ret;
    }
  }
});

// Indexes for better query performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ empCode: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ designation: 1 });
employeeSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get full name
employeeSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to get years of service
employeeSchema.methods.getYearsOfService = function() {
  const today = new Date();
  const joining = new Date(this.joiningDate);
  return Math.floor((today - joining) / (365.25 * 24 * 60 * 60 * 1000));
};

// Static method to find active employees
employeeSchema.statics.findActiveEmployees = function() {
  return this.find({ isActive: true });
};

// Static method to find employees by department
employeeSchema.statics.findByDepartment = function(department) {
  return this.find({ department, isActive: true });
};

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
employeeSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
