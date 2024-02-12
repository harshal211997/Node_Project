const Tour = require('../models/tourModels')
exports.getAllTour = async (req,res)=>{
    try{
        //1)excluding page, sort, limit and field from query object
        const queryObj = {...req.query};
        const excludeFields = ['page', 'sort', 'limit','field'];
        excludeFields.forEach(el => delete queryObj[el]);
        //will give data from query string from URL
        //using URL query string to filter data: API filtering

        //2)Advance URL query filtering as gt, gte, lt, lte
        //normal mongoDB filter {difficulty: 'easy', duration: {$gte: 5}}
        let queryStr = JSON.stringify(queryObj)//javaScript Object to json string
        queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`));// $gte
        let query = Tour.find(queryStr);

        //3)Sorting: sorting data by price using URL query string
        //e.g: localhost:8000/api/v1/tours?sort=price (default sort will be ASC)
        //To sort it DESC localhost:8000/api/v1/tours?sort=-price
        if(req.query.sort){
            //if two data having same price will sort it by ratingsAverage
            //localhost:8000/api/v1/tours?sort=price,ratingsAverage
            //but in mongoose query will be sort('price ratingsAverage')
            //so we need to convert query strng without ,
            //console.log(req.query.sort); -price,ratingsAverage
            const sortBy = req.query.sort.split(',').join(' ');
            //console.log(sortBy); -price ratingAverage
            query = query.sort(sortBy)
        }else{
            //sorting by default(on createdAt DESC) if no sort in query string 
            qeuery = query.sort('-createdAt')
        }
        const tours = await query;
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
        message:'No Record Found,Please try again!'
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