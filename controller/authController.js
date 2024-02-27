const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const User = require('./../models/usersModel.js');
const sendEmail = require('./../utils/email.js');
const crypto = require('crypto');

//creating json web token fucntion:
//for creating jwt token we need to pass payload: id and secrect ket which will be anything
//token header will created automatically on this all basis signature is created
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    //cookie property expire used to browser delete the cookie after it expire
    //we set cookie expire in 90 days from current date
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE_IN_COOKIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  //sending JWT using cookies:
  //Cookies is small pice of text of that server will send to client and client will store it in browser
  //when user send any api request then along with that request client will send cookies to server
  // curently we are sending cooki by postman so will off secur and use it in production only
  if (process.env.NODE_ENV === 'production') {
    //secure option will send cookie only in https connection
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  //hiding the password from response body
  user.password = undefined;
  res.status(statusCode).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  //calling jwt token function
  createSendToken(newUser, 200, res);
});
//login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1.check if email and pass is exists
  if (!email || !password) {
    //globalerror handler
    return next(new AppError('Please provide email and password', 400));
  }
  //2.user exists and pass is correct
  //select:Specifies which document fields to include or exclude (also known as the query "projection")
  //When using string syntax, prefixing a path with - will flag that path as excluded. When a path does not have the - prefix, it is included. Lastly, if a path is prefixed with +, it forces inclusion of the path, which is useful for paths excluded at the schema level.
  const user = await User.findOne({ email: email }).select('+password');
  //encrypting the password to compare with stores encypted password
  //calling correctPasswords method we added in user document in userModel
  //password: user entered password
  //user.password = password from user doc
  let correct;
  // checking for user exists
  if (user) {
    correct = await user.correctPasswords(password, user.password); // return true
  }
  //if user is not exists or password is incorrect
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3.if everything ok send jwt back to client
  createSendToken(user, 200, res);
});

//Authentication
// secure protacting all routes with authenticate : this function will use as a middle ware for calling all tours api
//and will authonticate user using jwt token
exports.protect = catchAsync(async (req, res, next) => {
  //1.Getting token check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    );
  }
  //2. validate token: if someone manipulated or token expires
  //if token is invalid then it will goes to gloel error handler
  //verify: it will decode payload, headers and secret key from provided token and create signiture
  // by provided secrete key parameter and from header, payload from token test signiture will create
  //last two signature will cpmpared and verify if not correct then give token expired or token invalid error
  //if someone modify token by decoding as id change then secrete will chnage and it will fail in compare signature
  const decoded = await jwt.verify(token, process.env.JWT_SECRET); // return a decoded token with id and all other parameter
  //3.Check if user still exists: what if user has deleted mean time or what if user chnaged pass after token inited, bith will not work
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    // user deleted
    return next(
      new AppError('The user belong to this token does no longer exists.', 401)
    );
  }
  //4.Check if userr changes password after the token was issued
  //decoded.iat is JWT created time which is under payload
  //changePasswordAfter method available in hole user schema
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password!, Please login again', 401)
    );
  }
  //Grant access to protected route
  req.user = freshUser;
  next();
});

//Authorization: check if certain user allowed to access certain data
//restirct routes: deleteing tours allowed for certain user
//we want to pass role in middleware so directlly it is not possible
//so we used rest patern and then returned new fun with reqn res and next
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin', 'lead-guid']
    //we have set user property in request at grant user ub protect user, so first protect user will run and after sucess that restrict will run
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You Do not have permission to perform this action', 403) // 403: authorization status code
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  //2.Genrate random reset token
  const resetToken = user.createPasswordResetToken();
  //we just modified passwordRestToken and passwordResetExpire field we are saving here in DB
  await user.save({ validateBeforeSave: false });
  //3.Sent it back as an email
  //defining reset URL which will send to email using forgot pass api
  //req.protocol = http://
  //req.get('host) = localhost
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfiorm to:${resetURL}\n If you didn't forgot your password, please ignore this email!`;

  //calling sendEmail which will retuen promise
  //sendEmail will pass with emailOptions
  //will handle seprate try catch block for error handling
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset tocken (valid for 10min)',
      message: message,
    });
    res.status(200).json({
      status: 'sucess',
      message: 'Token send to email',
    });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    //global error
    console.log(err);
    return next(
      new AppError(
        'There was an error while sending email. Try again leter!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.Get user based on token
  //we need to compare encryoted token saved in DB so we will encrypt the token coming from URL.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //geeting user based on token and checking the token is not expired
  //if passwordResetExpire > curent time then pass reset session is expired
  const user = await User.findOne({
    passwordRestToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  //2.If token has not expire, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //set token propert undefiend to remove it from DB
  user.passwordRestToken = undefined;
  user.passwordResetExpire = undefined;
  //we have modified pass but not saved, we need to save it
  //no need to turn off validator
  const newUser = await user.save();
  //3.Update changedPasswordAt property for the user
  //used pre document save in userModel file
  //4.Log the user in, sent JWT
  createSendToken(newUser, 200, res);
});

//update password functionallity for loged in user
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.Get user from collection
  //will find user by user property which we set on autentication req.user = freshUser
  const user = await User.findById(req.user.id).select('+password');
  //2.check posted pass is correct
  //will call correctPasswords instance method from user model to check current password is correct with typed pass
  if (!(await user.correctPasswords(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong!', 401));
  }
  //3.if pass correct then update pass
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  const newUser = await user.save();
  //4.log user in, send JWT token
  createSendToken(newUser, 201, res);
});
