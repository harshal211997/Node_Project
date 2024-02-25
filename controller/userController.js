const User = require('./../models/usersModel');
const catchAsync = require('./../utils/catchAsync');
const authController = require('./../controller/authController.js');
const AppError = require('./../utils/appError.js');

const filterObj = (obj, ...allFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allFields.includes[el]) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'sucess',
    result: users.length,
    data: {
      users,
    },
  });
});

//Updating existing data from use
exports.updateMe = catchAsync(async (req, res, next) => {
  //1.create an error if user try to update password data
  if (
    req.body.newPassword ||
    req.body.newPasswordConfirm ||
    req.body.passwordCurrent
  ) {
    return next(
      new AppError(
        'This rout is not for password update, please use /updateMyPassword',
        400
      )
    );
  }
  //2.filtering out unwanted field name that are not allowed to be update
  const filterdBody = filterObj(req.body, 'name', 'email');
  //3.update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'sucess',
    data: {
      user: updatedUser,
    },
  });
});
