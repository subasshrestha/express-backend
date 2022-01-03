require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const routeManager = require('./routes');
const logger = require('./helpers/logger');
const { handleError, ErrorHandler } = require('./helpers/errorHandler');

const app = express();

const corsAllowList = ['*'];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (corsAllowList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Database Connected'))
  .catch((err) => logger.error(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/', routeManager);

app.use((req, res, next) => {
  const err = new ErrorHandler(400, 'Method not allowed');
  next(err);
});

app.use((err, req, res, next) => {
  if (!err.isOperational) {
    logger.log({
      level: 'error',
      message: err.stack,
    });
  }
  handleError(err, res);
});

app.listen(process.env.PORT, () => {
  logger.info(`App is started at port: ${process.env.PORT}`);
});
