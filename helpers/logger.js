const winston = require('winston');

const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'DD-MM-YYYY HH:MM:SS',
  }),
  winston.format.printf(
    (info) => `${info.timestamp}  [${info.level}] : ${info.message}`,
  ),
);

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize({ all: true }), customFormat),
    }),
    new winston.transports.File({
      filename: `${process.cwd()}/error.log`,
      level: 'error',
      format: customFormat,
    }),
  ],
});

module.exports = logger;
