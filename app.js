const express = require('express');
const app = express();
//request body parser
app.use(express.json())
module.exports = app;