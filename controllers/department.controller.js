const Department = require('../models/Department.model');
const Employee = require('../models/employee.model');

exports.getDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { departmentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const departments = await Department.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Department.countDocuments(query);

    res.json({
      success: true,
      data: departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

exports.getActiveDepartments = async (req, res) => {
  try {
    const departments = await Department.findActive();

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error fetching active departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active departments',
      error: error.message
    });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    const departmentId = await Department.generateNextId();

    const department = new Department({
      departmentId,
      name: name.trim(),
      description: description?.trim(),
      isActive
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, isActive, departmentId } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name already exists'
        });
      }
    }

    if (departmentId && departmentId !== department.departmentId) {
      const existingDeptId = await Department.findOne({
        departmentId: departmentId,
        _id: { $ne: req.params.id }
      });
      if (existingDeptId) {
        return res.status(400).json({
          success: false,
          message: 'Department with this ID already exists'
        });
      }
      department.departmentId = departmentId;
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description?.trim();
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const employeeCount = await Employee.countDocuments({
      department: department.name,
      isActive: true
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${employeeCount} active employees are assigned to this department.`
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

exports.toggleDepartmentStatus = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    department.isActive = !department.isActive;
    await department.save();

    res.json({
      success: true,
      message: `Department ${department.isActive ? 'activated' : 'deactivated'} successfully`,
      data: department
    });
  } catch (error) {
    console.error('Error toggling department status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling department status',
      error: error.message
    });
  }
};

exports.getDepartmentEmployees = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const employees = await Employee.find({
      department: department.name,
      isActive: true
    }).select('-password');

    res.json({
      success: true,
      data: {
        department,
        employees,
        employeeCount: employees.length
      }
    });
  } catch (error) {
    console.error('Error fetching department employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department employees',
      error: error.message
    });
  }
};

exports.updateEmployeeCounts = async (req, res) => {
  try {
    const departments = await Department.find();

    for (const department of departments) {
      await department.updateEmployeeCount();
    }

    res.json({
      success: true,
      message: 'Employee counts updated for all departments'
    });
  } catch (error) {
    console.error('Error updating employee counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee counts',
      error: error.message
    });
  }
};
