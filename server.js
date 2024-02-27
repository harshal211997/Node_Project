const mongoose = require('mongoose');
const tourRouter = require('./router/tourRouter.js');
const userRouter = require('./router/userRouter.js');
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controller/errorController.js');
const dotEnv = require('dotenv');
//rate limit package is used to limit the api request coming from one IP
const rateLimit = require('express-rate-limit');
//http secure package
const helmet = require('helmet');

dotEnv.config({ path: './config.env' });
console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE_NAME.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB Connection Successful!');
  });
const app = require('./app.js');
const port = process.env.PORT || 3000;

//checking request headers middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.headers);
//   next();
// });

//http secure: Global middleware
app.use(helmet());

//Global middleware:rate limit
//rateLimit is a function which will take a limit options
//this will help use the root force attack from hackers
const limiter = rateLimit({
  //we are limited 100 request from one IP in 1hr
  max: 3,
  windowMs: 60 * 60 * 1000,
  //message if limit cross
  message: 'To many request from this IP, please try again after an hour!',
});
//applying limiter middleware for all request coming from /api
app.use('/api', limiter);
//routing
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

//Handling unhandled Routes:
//if someone hit wrong url then after all middleware it will come to this route and send back response
//e.g if someone hit /api/v2/tours
//all is for all get, post, patch request etc.
//* is for all url and thats why this middleware is at last
app.all('*', (req, res, next) => {
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
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // calling Error class
});

//Global (central error handling) for our application using middleware:
app.use(globalErrorHandler);
const server = app.listen(port, 'localhost', () => {
  console.log(`App started to listen on ${port}`);
});
