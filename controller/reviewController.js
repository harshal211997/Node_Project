const review = require('./../models/reviewModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const factory = require('./../controller/handlerFactory.js');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  const reviews = await review.find(filter);
  res.status(200).json({
    status: 'sucess',
    result: reviews.length,
    data: {
      reviews,
    },
  });
});
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

exports.createReview = factory.createOne(review);
exports.updateReview = factory.updateOne(review);
exports.deleteReview = factory.deleteOne(review);
