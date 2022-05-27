require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

const { access } = require('./middlewares/access');
const routeManager = require('./routes');
const { logger } = require('./helpers/logger');
const { handleError, ErrorHandler } = require('./helpers/errorHandler');
const { corsOptions } = require('./helpers/cors');

const app = express();
const server = http.createServer(app);

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Database Connected'))
  .catch((err) => logger.error(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1', access, routeManager);

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

// server starts working
server.listen(process.env.PORT || 8000, () => {
  logger.info(`App is started at port: ${process.env.PORT || 8000}`);
});
