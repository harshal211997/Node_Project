const Mongoose =  require("mongoose")

//schema declaration: dcocument structure
const tourSchema = new Mongoose.Schema({
    name:{
        type:String,
        required: [true,'A tour must have name'],
        unique:true
    },
    rating:{
        type:Number,
        default: 4.5
    },
    price:{
        type:Number,
        required:[true, 'A tour must have price']
    }
});
//Colletion
const Tour = Mongoose.model('Tour', tourSchema)

module.exports  = Tour;