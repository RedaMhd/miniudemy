const rabbitmq = require('./rabbitmq');
const auth = require('./middleware/auth');

module.exports = {
  rabbitmq,
  auth
};
