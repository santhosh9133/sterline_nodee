const express = require('express');
const router = express.Router();
const stateController = require('../controllers/state.controller');

// 🟩 Make sure all these functions are defined & exported
router.get('/', stateController.getStates);
router.get('/active', stateController.getActiveStates);
router.get('/:id', stateController.getStateById);
router.post('/', stateController.createState);
router.put('/:id', stateController.updateState);
router.delete('/:id', stateController.deleteState);
router.put('/:id/toggle-status', stateController.toggleStateStatus);
router.get('/country/:countryId', stateController.getStatesByCountry);

module.exports = router;
