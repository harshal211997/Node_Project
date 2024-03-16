//We created this file to import sample dev json data in DB
//This file we need to run only one at a time of application starting
//so will run it manually using seprate terminal.
const mongoose = require('mongoose');
const fs = require('fs');
const dotEnv = require('dotenv');
const Tour = require('../../models/tourModels.js');
const User = require('../../models/usersModel.js');
const Reviews = require('../../models/reviewModel.js');

dotEnv.config({ path: './config.env' });

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

//READ data from tours-sample.json
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//DELETING OLD data from DB
const deleteOldData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Reviews.deleteMany();
    console.log('Old Data Deleted sucessfully!');
  } catch (err) {
    console.log(err);
  }
};

//Importing json data in db
const importData = async () => {
  try {
    await Tour.create(tour);
    await User.create(user, { validateBeforeSave: false });
    await Reviews.create(review);
    console.log('New Data import Done!');
    //to stop process
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Calling function
deleteOldData();
importData();
