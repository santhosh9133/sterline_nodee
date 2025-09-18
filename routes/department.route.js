const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');

// Route Definitions
router.get('/', departmentController.getDepartments);
router.get('/active', departmentController.getActiveDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', departmentController.createDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);
router.put('/:id/toggle-status', departmentController.toggleDepartmentStatus);
router.get('/:id/employees', departmentController.getDepartmentEmployees);
router.put('/update-employee-counts', departmentController.updateEmployeeCounts);

module.exports = router;
