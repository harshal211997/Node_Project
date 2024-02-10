const express = require('express');
const tour = require('../controller/tourController.js')
const router = express.Router();

//tours router
router.route('/').get(tour.getAllTour).post(tour.createTour)
router.route('/:id').get(tour.getTour).patch(tour.updateTour).delete(tour.deleteTour)

module.exports = router;