const mongoose = require('mongoose');
const Tour = require('./tourModels.js');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review Cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: ['true', 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//populate data: populating tour and user data along with review
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});
//creating static method to calculate average of review
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //this points to review schema
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  //saving ratingsAverage into Tour Schema
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//calling static calcAverageRatings method:
reviewSchema.post('save', function (next) {
  //this points to current review
  this.constructor.calcAverageRatings(this.tour);
  // next();
});

//On update and delete review we need to update rating and avgRating
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  //console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  this.r.constructor.calcAverageRatings(this.r.tour);
});

const review = mongoose.model('review', reviewSchema);

module.exports = review;
