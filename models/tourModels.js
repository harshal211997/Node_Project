const Mongoose =  require("mongoose")

//schema declaration: dcocument structure
const tourSchema = new Mongoose.Schema({
    name:{
        type:String,
        required: [true,'A tour must have name'],
        unique:true,
        trim: true
    },
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
        required: [true, 'A tour must have descripion']
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
    },
    //tour will start at different dates e.g Dec-10, Feb-11
    startDates: {
        type: [Date],

    }
});
//Colletion
const Tour = Mongoose.model('Tour', tourSchema)

module.exports  = Tour;