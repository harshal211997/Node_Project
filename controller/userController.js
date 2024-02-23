const User = require('./../models/usersModel');
const catchAsync = require('./../utils/catchAsync');

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
