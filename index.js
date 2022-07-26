require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const { access } = require('./middleware/access');
const routeManager = require('./routes');
const { logger } = require('./helpers/logger');
const { handleError, ErrorHandler } = require('./helpers/errorHandler');
const { corsOptions } = require('./helpers/cors');
const { opts } = require('./helpers/redisConnection');

const app = express();
const redisClient = opts.createClient();
const limiter = rateLimit({
  windowMs: 1000, // 1 seconds
  max: 3, // limit each IP to 3 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1', access, routeManager);

app.get('/', (req, res) => res.json({
  status: 'success',
  message: 'Connection Established',
}));

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

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('MongoDB:: Database Connected'))
  .catch((err) => logger.error(err));

const server = http.createServer(app);
server.listen(process.env.PORT || 8000, () => {
  logger.info(`App is started at port: ${process.env.PORT || 8000}`);
});
