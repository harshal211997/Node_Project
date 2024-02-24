const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const User = require('./../models/usersModel.js');
const sendEmail = require('./../utils/email.js');

//creating json web token fucntion:
//for creating jwt token we need to pass payload: id and secrect ket which will be anything
//token header will created automatically on this all basis signature is created
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  //calling jwt token function
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'sucess',
    token,
    data: {
      user: newUser,
    },
  });
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
  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token,
  });
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

exports.resetPassword = (req, res, next) => {};
