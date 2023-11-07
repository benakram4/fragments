// src/routes/api/post.js

const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse, createSuccessResponse } = require('../../response');

const router = express.Router();

router.post('/fragments', async (req, res, next) => {
  const API_URL = `http://${req.headers.host}`;
  try {
    logger.info(`API_URL: ${API_URL}`);

    // get the type from the request
    const { type } = contentType.parse(req);
    logger.debug(`contentType.parse(req): ${type}`);
    // check if the type is supported
    if (!Fragment.isSupportedType(type)) {
      logger.warn(`415 type is not supported`);
      res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }
    logger.debug(`type: ${type}`);

    // get the body from the request
    const data = req.body;
    logger.debug(`req.body: ${data}`);

    if (Buffer.isBuffer(data)) {
      // create a new fragment
      const fragment = new Fragment({
        ownerId: req.user,
        type: type,
      });

      logger.debug(`fragment ownerId: ${fragment.ownerId}, saving fragment...`);
      await fragment.save();
      await fragment.setData(data);
      logger.debug(`fragment size: ${fragment.size}`);
      logger.debug(`fragment saved`);

      // send the response
      const location = `${API_URL}/v1/fragments/${fragment.id}`;
      logger.debug(`location: ${location}`);
      res.location(location);

      res.status(201).json(
        createSuccessResponse({
          fragment: fragment,
        })
      );
    } else {
      logger.warn(`400 req.body is not a Buffer`);
      res.status(400).json(createErrorResponse(400, 'invalid request, missing data'));
    }
  } catch (err) {
    logger.error(`Error in POST /fragments: ${err}`);
    next(err);
  }
});

module.exports = router;
