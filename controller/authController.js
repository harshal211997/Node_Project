const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const User = require('./../models/usersModel.js');

//creating json web token fucntion:
//for creating jwt token we need to pass payload: id and secrect ket which will be anything
//token header will created automatically on this all basis signature is created
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
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
