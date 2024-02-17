const Mongoose =  require("mongoose")
const slugify = require('slugify')

//schema declaration: dcocument structure
const tourSchema = new Mongoose.Schema({
    name:{
        type:String,
        required: [true,'A tour must have name'],
        unique:true,
        trim: true
    },
    slug: String,
    duration:{
        type:Number,
        required:[true, 'A Tour Must have duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true, 'A Tour Must have group size']
    },
    difficulty:{
        type:String,
        required:[true, 'Should have a difficulty']
    },
    ratingAverage:{
        type:Number,
        default: 4.5
    },
    ratingQuantity:{
        type:Number,
        default: 0
    },
    price:{
        type:Number,
        required:[true, 'A tour must have price']
    },
    priceDiscount:{
        type: Number
    },
    summary: {
        type: String,
        //remove all white space at begining and end of string
        trim: true
    },
    description:{
        type: String,
        trim: true,
       // required: [true, 'A tour must have descripion']
    },
    //image name (string), will put just imae name in DB and store the image in fileSystem
    imageCover:{
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    //images: array of images so will use array[] with string datatype
    images:{
        type: [String]
    },
    createdAt:{
        type: Date,
        default: Date.now(), //return timestamp in ms
        select : false
    },
    //tour will start at different dates e.g Dec-10, Feb-11
    startDates: {
        type: [Date],

    },
    //for query middleware
    secrateTour : {
        type: Boolean,
        default: false
    }
},
//schema options to get virtual property out 
{
    toJSON: { virtuals: true },
    toObject : { virtuals : true}
});

//virtual property: to set some property modified which outside a database
//need to use regular function insted of arrow because arrow function does not have this keyword
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
})

//Document Middleware is monggose middleware: runs only for .save() and .create() command
//to see any document save before DB we will use pre Document middleware
tourSchema.pre('save',function(next){
   // console.log(this);
   this.slug = slugify(this.name, {lower: true});
   next();
})
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
tourSchema.pre('find', function(next) {
    this.find({secrateTour : {$ne: true}});
    this.start = Date.now();
    next();
})
//for find one document
tourSchema.pre('findOne',function(next){
    this.findOne({secrateTour: {$ne: true}});
    this.start = Date.now();
    next();
})
tourSchema.post(/^find/, function(doc, next){
    console.log(`Query Took ${Date.now() - this.start} milliseconds!`);
  //  console.log(doc);
    next();
})

//Aggregation middleware: this will point to aggregate object in our query
tourSchema.pre('aggregate',function(next){
    //adding new filter in aggregation middleware using pipline
    this.pipeline().unshift({$match : {secrateTour : {$ne: true}}})
    //console.log(this.pipeline());
    next();
});
//Colletion
const Tour = Mongoose.model('Tour', tourSchema)

module.exports  = Tour;


