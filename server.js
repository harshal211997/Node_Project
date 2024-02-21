const mongoose = require('mongoose')
const router = require('./router/tourRouter.js')
const AppError = require('./utils/appError.js')
const globalErrorHandler = require('./controller/errorController.js')
const dotEnv = require('dotenv');

dotEnv.config({path:'./config.env'})
console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE_NAME.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=>{
    console.log('DB Connection Successful!')
})
const app = require('./app.js')
const port = process.env.PORT || 3000;
//routing
app.use('/api/v1/tours',router)

//Handling unhandled Routes:
//if someone hit wrong url then after all middleware it will come to this route and send back response
//e.g if someone hit /api/v2/tours
//all is for all get, post, patch request etc.
//* is for all url and thats why this middleware is at last
app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`
    // })

    //creating own error object and defining status and statusCode
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    //calling next with parameter then express will assume an err
    //using AppError class
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));// calling Error class
})

//Global (central error handling) for our application using middleware:
app.use(globalErrorHandler)
const server = app.listen(port,'localhost',()=>{
    console.log(`App started to listen on ${port}`);
});

//handle async fucntion unhandled promises
//as if mongoDB connection failed then it will return unhandled event
//so will use event listner to listen 'unhandledRejection'
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection, Shutting Down...');
    server.close(()=>{
        process.exit(1);
    })
})