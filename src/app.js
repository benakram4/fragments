//src/app.js

//importing modules
/*
Express.js provides the core framework for building web applications.
CORS helps control cross-origin requests and resource sharing.
Helmet enhances the security of your application by setting security-related HTTP headers.
Compression improves the performance of your application by compressing HTTP responses, reducing bandwidth usage.
*/
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// author and version from our package.json file
const { author, version, repository } = require('../package.json');

// import logger
const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// use pino logging middleware
app.use(pino);

// use helmentjs security middleware
app.use(helmet());

// use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// create a GET route for the root path, if server is running correctly,
// it will return a 200 status code, else it will return a 500 status code
app.get('/', (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching
  res.setHeader('Cache-Control', 'no-cache');

  // send 200 'OK' response with info about the repo
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: repository.url,
    version,
  });
});

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // We may already have an error response we can use, but if not,
  // use a generic `500` server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

// Export our `app` so we can access it in server.js
module.exports = app;