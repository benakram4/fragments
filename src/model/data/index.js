// src/model/data/index.js
const logger = require('../../logger');
// If the environment sets an AWS Region, we'll use AWS backend
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.

if(process.env.AWS_REGION && process.env.AWS === 'true') {
  logger.info('Using AWS backend services');
  module.exports =  require('./aws')

  } else{
  logger.info('Using in-memory backend services');
  module.exports = require('./memory');
}
