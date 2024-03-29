class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = true;
  }
}

function handleError(err, res) {
  res.status(err.StatusCode || 500).json({
    status: 'error',
    message: err.message ?? 'Internal server error',
  });
}

const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = { ErrorHandler, handleError, catchAsync };
