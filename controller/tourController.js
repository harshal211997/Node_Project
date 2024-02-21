const Tour = require('../models/tourModels')
const createApiFeature = require('../utils/tourApiFeatureUtil.js')
const catchAsync = require('../utils/catchAsync.js')
const AppError = require('../utils/appError.js')
//middle ware for top5Tours as a API alies name
exports.topFiveTour = (req,res, next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price'
    next();
}
exports.getAllTour = catchAsync(async (req,res, next)=>{
        const apiFeature = new createApiFeature(Tour.find(),req.query);
        apiFeature
        .filter()
        .sort()
        .limitField()
        .paginate();
        const tours = await apiFeature.query;
    res.status(200).json({
        status:'success',
        result: tours.length,
        data:{
            tours
        }
    })
});
exports.getTour =  catchAsync(async (req,res, next)=>{
    //db.tours.findOne({_id: req.params.id})
    const tour = await Tour.findById(req.params.id);
    //if tour not found will set correct message for user
    if(!tour){
        return next(new AppError(`No Tour Found For ID : ${req.params.id}`, 404));
    }
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })

});
exports.createTour = catchAsync(async (req,res, next)=>{
            const newTour = await Tour.create(req.body);
            res.status(201).json({
                status:'sucess',
                data:{
                    tour: newTour
                }
            })
});
//Update Tour: PTACH:
exports.updateTour = catchAsync(async (req,res)=>{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true
        });
         //if tour not found will set correct message for user
    if(!tour){
        return next(new AppError(`No Tour Found For ID : ${req.params.id}`, 404));
    }
        res.status(200).json({
            status:'sucess',
            tour,
        })
})
//delte Tour:
exports.deleteTour = catchAsync(async (req,res, next) => {
        const tour = await Tour.findByIdAndDelete(req.params.id);
         //if tour not found will set correct message for user
    if(!tour){
        return next(new AppError(`No Tour Found For ID : ${req.params.id}`, 404));
    }
        res.status(200).json({
            status:'sucess',
            data: null
        })
});

exports.getTourStats = catchAsync(async (req,res, next) =>{
        const stats = await Tour.aggregate([
            {
                $match : {ratingAverage: {$gte : 4.5}}
            },
            {
                $group : {
                    _id: {$toUpper: '$difficulty'},
                    numTours : {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            },
            {
                $sort:{
                    avgPrice : 1
                }
            },
            //match on result geting by query
            // {
            //     $match :{
            //         _id: {$ne :'EASY'}
            //     }
            // }
        ]);
        res.status(200).json({
            status: 'sucess',
            stats
        });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            //unwind will seprate out documnent on given field(but that need to be an array)
            //here we are unwinding data on startDates so will get document for each startDate
            {
                $unwind: '$startDates'
            },
            {
                $match: {startDates: 
                        {
                         $gte : new Date(`${year}-01-01`),
                         $lte: new Date(`${year}-12-31`),
                        }
                        }
            },
            {
                $group : {
                    _id: {$month :'$startDates'},
                    numToursStarts: {$sum: 1},
                    tours :{$push: '$name'}
                }
            },
            {
                $addFields : 
                {
                    month : '$_id'
                }
            },
            {
                $project: {
                    _id: 0,
                }
            },
            {
                $sort: {
                    numToursStarts : -1
                }
            },
            {
                $limit : 12
            }
        ]);
        res.status(200).json({
            status: 'sucess',
            resultLength: plan.length,
            data: plan
        });
});