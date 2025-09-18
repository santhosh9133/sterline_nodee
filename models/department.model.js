const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  employeeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for improved query performance
departmentSchema.index({ departmentId: 1 });
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });

// Static method to generate next department ID
departmentSchema.statics.generateNextId = async function() {
  const lastDepartment = await this.findOne({}, { departmentId: 1 }, { sort: { departmentId: -1 } });
  
  if (!lastDepartment) {
    return 'DEP001';
  }

  const lastNumber = parseInt(lastDepartment.departmentId.substring(3));
  const nextNumber = lastNumber + 1;
  return `DEP${nextNumber.toString().padStart(3, '0')}`;
};

// Static method to find all active departments sorted by name
departmentSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Instance method to update employee count for the department
departmentSchema.methods.updateEmployeeCount = async function() {
  const Employee = mongoose.model('Employee');
  const count = await Employee.countDocuments({ 
    department: this.name, 
    isActive: true 
  });
  this.employeeCount = count;
  return this.save();
};

module.exports = mongoose.model('Department', departmentSchema);
