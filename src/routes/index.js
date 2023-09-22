// src/routes/index.js

const express = require('express');

// Import the functions that we'll use to create our responses
const { createSuccessResponse } = require('../response');

// Our authentication middleware
const { authenticate } = require('../auth');

// author and version from our package.json file
const { author, version, repository } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all so you have to be authenticated in order to access.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // send 200 'OK' response with info about the repo
  res.status(200).json(
    createSuccessResponse({
      status: 'ok',
      author,
      githubUrl: repository.url,
      version,
    })
  );
});

module.exports = router;
