exports.access = (req, res, next) => {
  if (req.headers.authorization === process.env.APP_SECRET_KEY) {
    return next();
  }
  return res.status(401).json({ status: 'success', message: 'Unauthorized' });
};
