const express = require('express');
const router = express.Router();
const countryController = require('../controllers/country.controller');

// ✅ Ensure these controller functions exist in country.controller.js
router.get('/', countryController.getCountries);
router.get('/active', countryController.getActiveCountries);
router.get('/:id', countryController.getCountryById);
router.post('/', countryController.createCountry);
router.put('/:id', countryController.updateCountry);
router.delete('/:id', countryController.deleteCountry);
router.put('/:id/toggle-status', countryController.toggleCountryStatus);

module.exports = router;
