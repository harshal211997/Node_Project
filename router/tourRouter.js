const express = require('express');
const tour = require('../controller/tourController.js')
const router = express.Router();

//Alies name router
//If we want to fetch data for top 5 tours with ratingAgerage Desc and for same ratingAverage sort by price
//using middle ware as tour.top5Tour will set query string
router.route('/top-5-tours').get(tour.topFiveTour, tour.getAllTour);
//tours router
router.route('/').get(tour.getAllTour).post(tour.createTour)
router.route('/:id').get(tour.getTour).patch(tour.updateTour).delete(tour.deleteTour)

module.exports = router;