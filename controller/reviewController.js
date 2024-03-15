const review = require('./../models/reviewModel.js');
// const catchAsync = require('./../utils/catchAsync.js');
const factory = require('./../controller/handlerFactory.js');

exports.getAllReviews = factory.getAll(review);
//tourId and userId middleware
exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};
exports.getReview = factory.getOne(review);
exports.createReview = factory.createOne(review);
exports.updateReview = factory.updateOne(review);
exports.deleteReview = factory.deleteOne(review);
