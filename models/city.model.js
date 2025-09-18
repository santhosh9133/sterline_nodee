const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  cityId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
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

// Indexes
citySchema.index({ cityId: 1 });
citySchema.index({ name: 1 });
citySchema.index({ countryId: 1 });
citySchema.index({ isActive: 1 });

// Static method to generate next city ID
citySchema.statics.generateNextId = async function () {
  const lastCity = await this.findOne({}, { cityId: 1 }, { sort: { cityId: -1 } });

  if (!lastCity) return 'CTY001';

  const lastNumber = parseInt(lastCity.cityId.substring(3)); // Remove "CTY"
  const nextNumber = lastNumber + 1;

  return `CTY${nextNumber.toString().padStart(3, '0')}`; // e.g., CTY002
};

// Static method to get all active cities
citySchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('City', citySchema);
