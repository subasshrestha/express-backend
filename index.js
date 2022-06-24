require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const routeManager = require('./routes');
const logger = require('./helpers/logger');
const { handleError, ErrorHandler } = require('./helpers/errorHandler');
const { corsOptions } = require('./helpers/cors');
const { opts } = require('./helpers/redisConnection');

const app = express();
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  delayMs: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: opts.createClient(),
    expiry: 10 * 60,
  }),
});

app.enable('trust proxy');
app.use(cors(corsOptions));
app.use(limiter);

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('MongoDB:: Database Connected'))
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
