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
        console.log(queryStr);
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
            query = query.sort('-createdAt')
        }
        //4.)field Limiting the result(fetchining only certain columns)
        //to field limit result will use fields filter
        //URL: localhost:8000/api/v1/tours?fields=name,duration,price
        //In mongoDB query if we want to filter data for particular column will use select query
        //e.g query.select('name duration price')
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');//name duration price
            //directly query object is not working here
            query = Tour.find().select(fields)
        }else{
            query = Tour.find().select('-__v');
        }

        //5.)Pagination and limit:
        //If we have 1000 data then its not good practice to show all data at a time
        //to avoid that will use pagination where we will display limited amount of data as per user input
        //e.g URL=localhost:8000/api/v1/tours?page=2&limit=3: user wants to see page 2 and on each page limit of document is 3
        //logic behind pagination is e.g page=2&limit=3: page 1 : 1-3 documents, page :2 4-6(document)
        //will use req.query.page and req.query.limit to get query value from URL
        //In mongoDB we have query like Tour.skip(3).limit(2)
        //simply skip() value will decide the page number
        //in skip() we need to pass how many result we want to skip to get page 2 
        const page = (req.query.page * 1) || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit)

        if(req.query.page){
            const numTours = await Tour.countDocuments();
            if(skip >= numTours) throw new Error ('No Data Exists');
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