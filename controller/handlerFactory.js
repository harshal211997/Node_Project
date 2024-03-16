const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const createApiFeature = require('../utils/tourApiFeatureUtil.js');
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

exports.getOne = (model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    //db.tours.findOne({_id: req.params.id})
    //populate() is used to get guides data along with tour
    let query = model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    //if tour not found will set correct message for user
    if (!doc) {
      return next(
        new AppError(`No Document Found For ID : ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    //to allow for nested GET reviews to tour
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const apiFeature = new createApiFeature(model.find(filter), req.query);
    apiFeature.filter().sort().limitField().paginate();
    const doc = await apiFeature.query; //.explain();
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });
