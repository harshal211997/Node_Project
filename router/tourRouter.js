const express = require('express');
const tour = require('../controller/tourController.js');
const router = express.Router();
const authController = require('./../controller/authController.js');

//Alies name router
//If we want to fetch data for top 5 tours with ratingAgerage Desc and for same ratingAverage sort by price
//using middle ware as tour.top5Tour will set query string
router.route('/top-5-tours').get(tour.topFiveTour, tour.getAllTour);

//aggergation api
router.route('/tours-stats').get(tour.getTourStats);
router.route('/monthly-plan/:year').get(tour.getMonthlyPlan);
//tours router
//will use middle ware to authenticate
router
  .route('/')
  .get(authController.protect, tour.getAllTour)
  .post(tour.createTour);
router
  .route('/:id')
  .get(tour.getTour)
  .patch(tour.updateTour)
  //for deleting tour first we are validating user with protect middleware and then we are checking userRole. if userRole is either admin or lead-guid then only we are giving permission to delete tour
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guid'),
    tour.deleteTour
  );

module.exports = router;
