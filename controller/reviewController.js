const review = require('./../models/reviewModel.js');
const catchAsync = require('./../utils/catchAsync.js');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await review.find();
  res.status(200).json({
    status: 'sucess',
    result: review.length - 1,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  const newReview = await review.create(req.body);
  res.status(201).json({
    status: 'sucess',
    data: {
      review: newReview,
    },
  });
});
