const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  designationId: {
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
  }
}, {
  timestamps: true
});

// Index for better query performance
designationSchema.index({ designationId: 1 });
designationSchema.index({ name: 1 });
designationSchema.index({ isActive: 1 });

// Static method to generate next designation ID
designationSchema.statics.generateNextId = async function () {
  const lastDesignation = await this.findOne(
    {},
    { designationId: 1 },
    { sort: { designationId: -1 } }
  );

  if (!lastDesignation) {
    return 'DES001';
  }

  // Extract number from last designation ID (e.g., DES001 -> 001)
  const lastNumber = parseInt(lastDesignation.designationId.substring(3));
  const nextNumber = lastNumber + 1;

  // Format with leading zeros (e.g., 2 -> 002)
  return `DES${nextNumber.toString().padStart(3, '0')}`;
};

// Static method to find active designations
designationSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Designation', designationSchema);
