const Redis = require('ioredis');

const client = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

exports.opts = {
  createClient(type) {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      default:
        return new Redis(process.env.REDIS_URL);
    }
  },
};
