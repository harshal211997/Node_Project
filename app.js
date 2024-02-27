const express = require('express');
const app = express();
//request body parser: reading data from body into req.body
app.use(express.json());
module.exports = app;
