const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  countryId: {
    type: String,
    unique: true,
    required: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
stateSchema.index({ name: 1 });
stateSchema.index({ countryId: 1 });
stateSchema.index({ country: 1 });
stateSchema.index({ isActive: 1 });

// Static method to generate next stateId (e.g., ST001, ST002)
stateSchema.statics.generateNextId = async function () {
  const lastState = await this.findOne({}, { stateId: 1 }).sort({ stateId: -1 });

  if (!lastState) return 'ST001';

  const lastNumber = parseInt(lastState.stateId.substring(2)); // Remove 'ST'
  const nextNumber = lastNumber + 1;

  return `ST${nextNumber.toString().padStart(3, '0')}`;
};

// Static method to find all active states
stateSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('State', stateSchema);
