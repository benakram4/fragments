// src/routes/api/post.js

const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse, createSuccessResponse } = require('../../response');


const router = express.Router();

router.post('/fragments', async (req, res, next) => {
  const API_URL = process.env.API_URL || `http://${req.headers.host}`;
  try {
    logger.info(`API_URL: ${API_URL}`);

    // get the type from the request
    const { type } = contentType.parse(req);
    // check if the type is supported
    if (!Fragment.isSupportedType(type)) {
      logger.debug(`415 type is not supported`);
      res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }
    logger.debug(`type: ${type}`);

    // get the body from the request
    const data = req.body;
    // check if data is defined
    logger.debug(`req.body: ${data}`);

    // get user email from auth header
    const authHeader = req.headers.authorization;
    logger.debug(`authHeader: ${authHeader}`);
    const encodedCredentials = authHeader.split(' ')[1];
    logger.debug(`encodedCredentials: ${encodedCredentials}`);
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    logger.debug(`decodedCredentials: ${decodedCredentials}`);
    const email = decodedCredentials.split(':')[0];
    logger.debug(`email: ${email}`);


    if (Buffer.isBuffer(data)) {
      // create a new fragment
      const fragment = new Fragment({
        ownerId: email,
        type: type,
      });

      logger.debug(`fragment ownerId: ${fragment.ownerId}`);
      await fragment.save();
      await fragment.setData(data);
      logger.debug(`fragment saved`);

      // send the response
      res.status(201).json(createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          size: fragment.size,
          type: fragment.type,
          created: fragment.created,
          updated: fragment.updated,
          links: {
            self: `${API_URL}/v1/fragments/${fragment.id}`,
          },
        },
      }));
    } else {
      logger.debug(`400 req.body is not a Buffer`);
      res.status(400).json(createErrorResponse(400, 'invalid request, missing data'));
    }
  } catch (err) {
    logger.error(`Error in POST /fragments: ${err}`);
    next(err);
  }
});

module.exports = router;
