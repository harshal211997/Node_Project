const reviewController = require('./../controller/reviewController.js');
const authController = require('./../controller/authController.js');
const express = require('express');
//each router has access to there specific route, but here we need tourId from tourRouter
//so we need to specify it in form of object
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
