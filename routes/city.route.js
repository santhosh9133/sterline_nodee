const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');

// Get all cities
router.get('/', cityController.getCities);

// Get a single city by ID
router.get('/:id', cityController.getCityById);

// Create a new city
router.post('/', cityController.createCity);

// Update a city by ID
router.put('/:id', cityController.updateCity);

// Delete a city by ID
router.delete('/:id', cityController.deleteCity);

module.exports = router;
