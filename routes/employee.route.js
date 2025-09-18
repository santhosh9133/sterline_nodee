const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

// Routes

router.get('/', employeeController.getEmployees);

router.get('/:id', employeeController.getEmployeeById);

router.get('/code/:empCode', employeeController.getEmployeeByEmpCode);

router.post('/', employeeController.createEmployee);

router.put('/:id', employeeController.updateEmployee);

router.delete('/:id', employeeController.deactivateEmployee);

router.delete('/:id/permanent', employeeController.deleteEmployeePermanent);

router.put('/:id/activate', employeeController.activateEmployee);

router.get('/stats/overview', employeeController.getEmployeeStats);

router.get('/departments/list', employeeController.getDepartments);

router.get('/designations/list', employeeController.getDesignations);

router.post('/upload-profile-image', employeeController.uploadProfileImage);

router.post('/login', employeeController.employeeLogin);

module.exports = router;
