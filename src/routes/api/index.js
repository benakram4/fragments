// src/routes/api/index.js

const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });



// Define our second route, which will be: POST /v1/fragments
// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
// You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
router.post('/fragments', rawBody(), require('./post'));

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

// Define our third route, which will be: GET /v1/fragments?expand=1
// where the expand flag is used to get full fragments
router.get('/fragments?expand=1', require('./get'));

// Define our fourth route, which will be: GET /v1/fragments/:id
router.get('/fragments/:id', require('./get'));

// Other routes will go here later on...

module.exports = router;
