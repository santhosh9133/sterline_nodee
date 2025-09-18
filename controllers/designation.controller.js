const Designation = require('../models/designation.model.js');

// Get all designations (with pagination, search, isActive)
exports.getAllDesignations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designationId: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const designations = await Designation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Designation.countDocuments(query);

    res.json({
      success: true,
      data: designations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching designations',
      error: error.message
    });
  }
};

// Get all active designations
exports.getActiveDesignations = async (req, res) => {
  try {
    const designations = await Designation.findActive();

    res.json({
      success: true,
      data: designations
    });
  } catch (error) {
    console.error('Error fetching active designations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active designations',
      error: error.message
    });
  }
};

// Get designation by ID
exports.getDesignationById = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }

    res.json({
      success: true,
      data: designation
    });
  } catch (error) {
    console.error('Error fetching designation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching designation',
      error: error.message
    });
  }
};

// Create new designation
exports.createDesignation = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Designation name is required'
      });
    }

    const existingDesignation = await Designation.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingDesignation) {
      return res.status(400).json({
        success: false,
        message: 'Designation with this name already exists'
      });
    }

    const designationId = await Designation.generateNextId();

    const designation = new Designation({
      designationId,
      name: name.trim(),
      description: description?.trim(),
      isActive
    });

    await designation.save();

    res.status(201).json({
      success: true,
      message: 'Designation created successfully',
      data: designation
    });
  } catch (error) {
    console.error('Error creating designation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating designation',
      error: error.message
    });
  }
};

// Update designation
exports.updateDesignation = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const designation = await Designation.findById(req.params.id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }

    if (name && name !== designation.name) {
      const existingDesignation = await Designation.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (existingDesignation) {
        return res.status(400).json({
          success: false,
          message: 'Designation with this name already exists'
        });
      }
    }

    if (name) designation.name = name.trim();
    if (description !== undefined) designation.description = description?.trim();
    if (isActive !== undefined) designation.isActive = isActive;

    await designation.save();

    res.json({
      success: true,
      message: 'Designation updated successfully',
      data: designation
    });
  } catch (error) {
    console.error('Error updating designation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating designation',
      error: error.message
    });
  }
};

// Delete designation
exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }

    await Designation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Designation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting designation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting designation',
      error: error.message
    });
  }
};

// Toggle designation status
exports.toggleDesignationStatus = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }

    designation.isActive = !designation.isActive;
    await designation.save();

    res.json({
      success: true,
      message: `Designation ${designation.isActive ? 'activated' : 'deactivated'} successfully`,
      data: designation
    });
  } catch (error) {
    console.error('Error toggling designation status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling designation status',
      error: error.message
    });
  }
};
