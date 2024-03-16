const reviewController = require('./../controller/reviewController.js');
const authController = require('./../controller/authController.js');
const express = require('express');
//each router has access to there specific route, but here we need tourId from tourRouter
//so we need to specify it in form of object
const router = express.Router({ mergeParams: true });

//prtecting all routes
router.use(authController.protect);
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
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
