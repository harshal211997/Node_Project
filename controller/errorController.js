const AppError = require('../utils/appError.js')
const handleCastErrorDB = (err) =>{
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};
const handleDuplicateFieldDB = (err) =>{
    const extarctName = err.keyValue.name;
    const message = `Duplicate field value: ${extarctName} please use another vale`;
    return new AppError(message, 400);

}

const handleValidationErrorDB = (err) => {
    const validationMessage = Object.values(err.errors)[0];
    const message = `Validation Error: ${validationMessage}.`
    return new AppError(message, 400);
}
const sendErrorDev = (err, res) =>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
};

const sendErrorProd = (err, res) =>{
    //checking for opertaional error in prod env: send msg to client
    if(err.isOperational){
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })}
    //programming error or unknown error: don't want leak error details to client
    else{
        //1.Log error
        console.log('Error',err);
        //2.send generic message
        res.status(500).json({
            status:'error',
            message:'Something went very wrong!'
        })
    }
}
//if we implement 4 paramerter as down express automatically knows this is centreal error handler
module.exports = ((err, req, res, next)=>{
    //reading status code from err object
    err.statusCode = err.statusCode || 500;
    //reading status from err object
    err.status = err.status || 'error';
   if(process.env.NODE_ENV === 'development'){
    sendErrorDev(err, res)
   }else if(process.env.NODE_ENV === 'production'){
    let error = {...err}
    //Handling DB operational error
    //1.invalid ID
    if(JSON.parse(JSON.stringify(err)).name === 'CastError'){
        error = handleCastErrorDB(error)
    }
    if(error.code === 11000){
        error = handleDuplicateFieldDB(error)
    }
    if(error._message === 'Validation failed'){
        error = handleValidationErrorDB(err);
      //  console.log(err.errors.difficulty.properties.message);
    }
    sendErrorProd(error, res)
   }
    });