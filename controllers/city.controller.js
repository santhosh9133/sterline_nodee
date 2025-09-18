const City = require('../models/city.model');

// Get all cities with optional search, filter, and pagination
exports.getCities = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, isActive, stateId } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (stateId) query.stateId = stateId;

    const cities = await City.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await City.countDocuments(query);

    res.json({
      success: true,
      data: cities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Error fetching cities', error: error.message });
  }
};

// Get a single city by ID
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    res.json({ success: true, data: city });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ success: false, message: 'Error fetching city', error: error.message });
  }
};

// Create a new city
exports.createCity = async (req, res) => {
  try {
    const { name, stateId, isActive = true } = req.body;

    if (!name || !stateId) {
      return res.status(400).json({
        success: false,
        message: 'Name and stateId are required',
      });
    }

    // Check for duplicate city name in the same state
    const existing = await City.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      stateId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'City with this name already exists in the state',
      });
    }

    // Auto-generate cityId
    const cityId = await City.generateNextId();

    const newCity = new City({
      cityId,
      name: name.trim(),
      stateId,
      isActive,
    });

    await newCity.save();

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: newCity,
    });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating city',
      error: error.message,
    });
  }
};

// Update a city by ID
exports.updateCity = async (req, res) => {
  try {
    const { name, isActive, stateId } = req.body;
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    // Check for duplicate name in the same state
    if (name && name !== city.name) {
      const existing = await City.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        stateId: stateId || city.stateId,
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another city with this name exists in the state',
        });
      }

      city.name = name.trim();
    }

    if (stateId) city.stateId = stateId;
    if (isActive !== undefined) city.isActive = isActive;

    await city.save();

    res.json({
      success: true,
      message: 'City updated successfully',
      data: city,
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ success: false, message: 'Error updating city', error: error.message });
  }
};

// Delete a city by ID
exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    res.json({ success: true, message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ success: false, message: 'Error deleting city', error: error.message });
  }
};

// Toggle city active/inactive
exports.toggleCityStatus = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    city.isActive = !city.isActive;
    await city.save();

    res.json({
      success: true,
      message: `City ${city.isActive ? 'activated' : 'deactivated'} successfully`,
      data: city,
    });
  } catch (error) {
    console.error('Error toggling city status:', error);
    res.status(500).json({ success: false, message: 'Error toggling city status', error: error.message });
  }
};

// Get all active cities
exports.getActiveCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error('Error fetching active cities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active cities',
      error: error.message,
    });
  }
};

// Get cities by state ID
exports.getCitiesByState = async (req, res) => {
  try {
    const stateId = req.params.stateId;
    const cities = await City.find({ stateId, isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error('Error fetching cities by state:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities by state',
      error: error.message,
    });
  }
};
