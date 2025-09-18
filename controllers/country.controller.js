const Country = require('../models/country.model');

// Get all countries (with pagination, search, and isActive filter)
exports.getCountries = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const countries = await Country.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Country.countDocuments(query);

    res.json({
      success: true,
      data: countries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ success: false, message: 'Error fetching countries', error: error.message });
  }
};

// Get all active countries (sorted by name)
exports.getActiveCountries = async (req, res) => {
  try {
    const countries = await Country.findActive();

    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Error fetching active countries:', error);
    res.status(500).json({ success: false, message: 'Error fetching active countries', error: error.message });
  }
};

// Get country by MongoDB ID
exports.getCountryById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    res.json({ success: true, data: country });
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ success: false, message: 'Error fetching country', error: error.message });
  }
};

// Create a new country
exports.createCountry = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Country name is required' });
    }

    // Check for duplicates
    const existing = await Country.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Country with this name already exists' });
    }

    const countryId = await Country.generateNextId();

    const country = new Country({
      countryId,
      name: name.trim(),
      description: description?.trim(),
      isActive
    });

    await country.save();

    res.status(201).json({ success: true, message: 'Country created successfully', data: country });
  } catch (error) {
    console.error('Error creating country:', error);
    res.status(500).json({ success: false, message: 'Error creating country', error: error.message });
  }
};

// Update a country
exports.updateCountry = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    // Check for name conflict with other countries
    if (name && name !== country.name) {
      const existing = await Country.findOne({
        name: new RegExp(`^${name}$`, 'i'),
        _id: { $ne: req.params.id }
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Another country with this name already exists' });
      }
    }

    if (name) country.name = name.trim();
    if (description !== undefined) country.description = description?.trim();
    if (isActive !== undefined) country.isActive = isActive;

    await country.save();

    res.json({ success: true, message: 'Country updated successfully', data: country });
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ success: false, message: 'Error updating country', error: error.message });
  }
};

// Delete a country
exports.deleteCountry = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    await Country.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ success: false, message: 'Error deleting country', error: error.message });
  }
};

// Toggle isActive status
exports.toggleCountryStatus = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    country.isActive = !country.isActive;
    await country.save();

    res.json({
      success: true,
      message: `Country ${country.isActive ? 'activated' : 'deactivated'} successfully`,
      data: country
    });
  } catch (error) {
    console.error('Error toggling country status:', error);
    res.status(500).json({ success: false, message: 'Error toggling country status', error: error.message });
  }
};
