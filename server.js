const mongoose = require('mongoose')
const app = require('./app.js')
const router = require('./router/tourRouter.js')
const dotEnv = require('dotenv');

dotEnv.config({path:'./config.env'})

const DB = process.env.DATABASE_NAME.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=>{
    console.log('DB Connection Successful!');
})
const port = process.env.PORT || 3000;
//routing
app.use('/api/v1/tours',router)
app.listen(port,'localhost',()=>{
    console.log(`App started to listen on ${port}`);
})