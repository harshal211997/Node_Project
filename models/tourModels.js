const Mongoose = require('mongoose');
const slugify = require('slugify');
//validator library for mongoose from npm
const validator = require('validator');
//const User = require('./../models/usersModel.js');

//schema declaration: dcocument structure
const tourSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'], //data validator
      unique: true, //not a really validator
      trim: true,
      maxLength: [40, 'A tour name must have less or eqal than 40 character'], //data validator
      minLength: [10, 'A tour name must have less or equal than 10 character'], //data validator
      //validating string should contain alphabate from a-z using validator library
      //validate: [validator.isAlpha, 'A tour name must only contain character']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour Must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Should have a difficulty'],
      //data validator: difficulty either be easy, medium, difficulty
      //we can't able to add error message in enum so will use object
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], //data validator
      max: [5, 'Rating must be below 5.0'], //data validator
      //set function(custome function) run each time when value recived for ratingsAverage
      //Math.round will give value without decimal so will multiply by 10 again divide by 10
      //e,.g.: 4.6666 => Math.round(4.6666)=> 4
      //so, 4.6666 * 10 => Math.round(46.666) => 46 => 46/ 10 => 4.6
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      //custom validator: will validate priceDiscount will be less than price
      //val: price discount value
      //from custom validator will return true or false
      //if its false then it will trigger validation error
      validate: {
        validator: function (val) {
          ////this will point only for creating new document not for update document
          return val < this.price; //100 < 200 //true else false
        },
        //message having access of val i.e VALUE => val
        message:
          'Discount price ({VALUE}) should be less than regular price value',
      },
    },
    summary: {
      type: String,
      //remove all white space at begining and end of string
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      // required: [true, 'A tour must have descripion']
    },
    //image name (string), will put just imae name in DB and store the image in fileSystem
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    //images: array of images so will use array[] with string datatype
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(), //return timestamp in ms
      select: false,
    },
    //tour will start at different dates e.g Dec-10, Feb-11
    startDates: {
      type: [Date],
    },
    //for query middleware
    secrateTour: {
      type: Boolean,
      default: false,
    },
    //this is mongoose Geo Special location object
    //which we need to create as object where type and coordinates field are mandetory
    startLocation: {
      //GeoJSON: geo special data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //Embeding location document into tour
    //using array of locations
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //referencing the user id as a guide of tour in tour Schema
    //child references: contain only user( guide ID)
    //Mongoose.Schema.OjectID is a fucntion of mongoose used to specify type of field
    //ref: used to inform tour schema refer to User Schema to parent chiled relationship(references)
    guides: [{ type: Mongoose.Schema.ObjectId, ref: 'User' }],
  },
  //schema options to get virtual property out
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
/*
//adding Index on price field to get good performance
//1 means sort by ascending order while -1 means descending order
//single index
tourSchema.index({ price: 1 });
*/
//compound index:
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
//virtual property: to set some property modified which outside a database
//need to use regular function insted of arrow because arrow function does not have this keyword
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//virtual populate
tourSchema.virtual('reviews', {
  ref: 'review',
  foreignField: 'tour', //field from reviewModel
  localField: '_id', //local field from tourModel
});
//Document Middleware is monggose middleware: runs only for .save() and .create() command
//to see any document save before DB we will use pre Document middleware
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});
//pre midleware for saving tour guid in tour model as embded documents
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// //we can able to call multiple middleware
// tourSchema.pre('save', function(next){
//     console.log('Will Save Document...');
//     next();
// })
// //Post Document middleware
// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// })

//Query middleware: before or after any query run will see output in query only no change in DB
//this keyword point to current query
//this will run find() method from controller and before query end this middleware will run and it will
//remove super secrate tour
tourSchema.pre('find', function (next) {
  this.find({ secrateTour: { $ne: true } });
  this.start = Date.now();
  next();
});
//for find one document
tourSchema.pre('findOne', function (next) {
  this.findOne({ secrateTour: { $ne: true } });
  this.start = Date.now();
  next();
});
//populate guides middleware:
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -_id',
  });
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query Took ${Date.now() - this.start} milliseconds!`);
  //  console.log(doc);
  next();
});

//Aggregation middleware: this will point to aggregate object in our query
tourSchema.pre('aggregate', function (next) {
  //adding new filter in aggregation middleware using pipline
  this.pipeline().unshift({ $match: { secrateTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});
//Colletion
const Tour = Mongoose.model('Tour', tourSchema);

module.exports = Tour;
