//Inherting AppError from Error class
//this class we are creating for handling only operational error
class AppError extends Error {
    constructor(message, statusCode){
        //calling parent class constructor which will only accepet err message
        super(message);//settign message property

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        //operational error property
        this.isOperational = true;

    }
}

module.exports = AppError;