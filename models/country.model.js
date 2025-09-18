const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  countryId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
countrySchema.index({ countryId: 1 });
countrySchema.index({ name: 1 });
countrySchema.index({ isActive: 1 });

// Static method to generate next country ID
countrySchema.statics.generateNextId = async function () {
  const lastCountry = await this.findOne({}, { countryId: 1 }, { sort: { countryId: -1 } });

  if (!lastCountry) return 'CNT001';

  const lastNumber = parseInt(lastCountry.countryId.substring(3)); // Remove "CNT"
  const nextNumber = lastNumber + 1;

  return `CNT${nextNumber.toString().padStart(3, '0')}`; // e.g., CNT002
};

// Static method to get all active countries
countrySchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Country', countrySchema);
