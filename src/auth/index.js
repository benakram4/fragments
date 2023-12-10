// src/auth/index.js

const logger = require('../logger');

// Prefer Amazon Cognito
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID && process.env.AUTH === 'cognito') {
  logger.info('using Amazon Cognito for authorization');
  module.exports = require('./cognito');
}
// Also allow for an .htpasswd file to be used, but not in production
else if (process.env.HTPASSWD_FILE && process.env.AUTH === 'basic') {
  logger.info('using .htpasswd file for authorization');
  module.exports = require('./basic-auth');
}
// In all other cases, we need to stop now and fix our config
else {
  throw new Error('missing env vars: no authorization configuration found');
}
