// controllers/state.controller.js

const State = require('../models/state.model');

// Get all states with optional search and pagination
exports.getStates = async (req, res) => {
  try {
    const { page = 1, limit = 100, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const states = await State.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await State.countDocuments(query);

    res.json({
      success: true,
      data: states,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ success: false, message: 'Error fetching states', error: error.message });
  }
};

// Get a single state by ID
exports.getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }
    res.json({ success: true, data: state });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ success: false, message: 'Error fetching state', error: error.message });
  }
};

// Create a new state
exports.createState = async (req, res) => {
  try {
    const { name, countryId, country, isActive = true } = req.body;

    if (!name || !countryId || !country) {
      return res.status(400).json({ success: false, message: 'Name, country, and countryId are required' });
    }

    const existing = await State.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, country, countryId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'State with this name already exists in the country' });
    }

    const newState = new State({ name: name.trim(), country, countryId, isActive });
    await newState.save();

    res.status(201).json({ success: true, message: 'State created successfully', data: newState });
  } catch (error) {
    console.error('Error creating state:', error);
    res.status(500).json({ success: false, message: 'Error creating state', error: error.message });
  }
};

// Define the function
exports.getActiveStates = async (req, res) => {
  try {
    const states = await State.find({ isActive: true });
    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active states',
      error: error.message
    });
  }
};

// Update a state by ID
exports.updateState = async (req, res) => {
  try {
    const { name, isActive, countryId } = req.body;
    const state = await State.findById(req.params.id);

    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    if (name && name !== state.name) {
      const existing = await State.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, countryId, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'State with this name already exists in the country' });
      }
      state.name = name.trim();
    }

    if (countryId) state.countryId = countryId;
    if (isActive !== undefined) state.isActive = isActive;

    await state.save();

    res.json({ success: true, message: 'State updated successfully', data: state });
  } catch (error) {
    console.error('Error updating state:', error);
    res.status(500).json({ success: false, message: 'Error updating state', error: error.message });
  }
};

// Delete a state by ID
exports.deleteState = async (req, res) => {
  try {
    const state = await State.findByIdAndDelete(req.params.id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }
    res.json({ success: true, message: 'State deleted successfully' });
  } catch (error) {
    console.error('Error deleting state:', error);
    res.status(500).json({ success: false, message: 'Error deleting state', error: error.message });
  }
};

// Toggle state active/inactive
exports.toggleStateStatus = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    state.isActive = !state.isActive;
    await state.save();

    res.json({
      success: true,
      message: `State ${state.isActive ? 'activated' : 'deactivated'} successfully`,
      data: state,
    });
  } catch (error) {
    console.error('Error toggling state status:', error);
    res.status(500).json({ success: false, message: 'Error toggling state status', error: error.message });
  }
};

// Get states by country ID
exports.getStatesByCountry = async (req, res) => {
  try {
    const countryId = req.params.countryId;
    const states = await State.find({ countryId, isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: states,
    });
  } catch (error) {
    console.error('Error fetching states by country:', error);
    res.status(500).json({ success: false, message: 'Error fetching states by country', error: error.message });
  }
};
