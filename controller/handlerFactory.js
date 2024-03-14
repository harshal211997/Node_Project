const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
//
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    //if tour not found will set correct message for user
    if (!doc) {
      return next(
        new AppError(`No Document Found For ID : ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'sucess',
      data: null,
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    //if tour not found will set correct message for user
    if (!doc) {
      return next(
        new AppError(`No Document Found For ID : ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'sucess',
      doc,
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'sucess',
      data: {
        doc,
      },
    });
  });
