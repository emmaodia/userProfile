const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

// const routeHandlers = require('./utilities/routehandlers');

//Need to run first
// let routes = JSON.parse(routeHandlers.handleRoutes());

//Router definitions
const profileRouter = require('./profile');
const userRouter = require('./user');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//App Router Views Navigation
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/user', userRouter);

// Database Set Up
const dbConfig = require('./database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(process.env.MONGOLAB_MAROON_URI || dbConfig.url, {
  keepAlive: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

//Error Handling set up
app.use((req, res, next) => {
  const error = new Error('404 Page Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
