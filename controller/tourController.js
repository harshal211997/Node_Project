const Tour = require('../models/tourModels')
const createApiFeature = require('../utils/tourApiFeatureUtil.js')
//middle ware for top5Tours as a API alies name
exports.topFiveTour = (req,res, next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price'
    next();
}
exports.getAllTour = async (req,res)=>{
    try{
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
}catch(err){
    res.status(404).json({
        status:'fail',
        message:err.message
    })
}
};
exports.getTour =  async (req,res)=>{
    try{
    //db.tours.findOne({_id: req.params.id})
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })
    }
    catch(err){
        res.status(404).json({
            status: 'fail',
            message:'Data not found!'
        })
    }

}
exports.createTour = async (req,res)=>{
    try{
            const newTour = await Tour.create(req.body);
            res.status(201).json({
                status:'sucess',
                data:{
                    tour: newTour
                }
            })
    }catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}
//Update Tour: PTACH:
exports.updateTour = async (req,res)=>{
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status:'sucess',
            tour,
        })
    }catch(err){
        res.status(400).json({
            status:'fail',
            message: err
        })
    }
}
//delte Tour:
exports.deleteTour = async (req,res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status:'sucess',
            data: null
        })
    }catch(err){
        res.status(400).json(({
            status: 'fail',
            message: err.message
        }))
    }
}