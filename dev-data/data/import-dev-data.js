//We created this file to import sample dev json data in DB
//This file we need to run only one at a time of application starting
//so will run it manually using seprate terminal.
const mongoose = require('mongoose');
const fs = require('fs');
const dotEnv = require('dotenv');
const Tour = require('../../models/tourModels')

dotEnv.config({path:'./config.env'})

const DB = process.env.DATABASE_NAME.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=>{
    console.log('DB Connection Successful!');
})


//READ data from tours-sample.json
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//DELETING OLD data from DB
const deleteOldData = async () =>{
    try{
    await Tour.deleteMany();
    console.log('Old Data Deleted sucessfully!');
    }catch(err){
        console.log(err);
    }
};

//Importing json data in db
const importData = async () => {
    try{
    await Tour.insertMany(tour);
    console.log('New Data import Done!');
    //to stop process
    process.exit();
    }catch(err){
        console.log(err);
    }
}

//Calling function
deleteOldData();
importData();