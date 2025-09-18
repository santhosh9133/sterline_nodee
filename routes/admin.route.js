const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Admin Auth
router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/setup-super-admin', adminController.setupSuperAdmin);

// Admin CRUD
router.get('/', adminController.getAllAdmins);
router.get('/:id', adminController.getAdminById);
router.put('/:id', adminController.updateAdminProfile);
router.put('/:id/password', adminController.changeAdminPassword);
router.delete('/:id', adminController.deactivateAdmin);
router.put('/:id/activate', adminController.activateAdmin);

// Admin Stats
router.get('/stats/overview', adminController.getAdminStats);

module.exports = router;
