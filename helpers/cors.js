const { allowList } = require('../config/cors.json');

exports.corsOptions = {
  origin: (origin, callback) => {
    if (allowList.indexOf(origin) === -1 || !origin) {
      callback(null, false);
    } else {
      callback(null, true);
    }
  },
};
