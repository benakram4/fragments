// src/routes/api/get.js

// imports
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // get user email from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('401 Unauthorized');
      res.status(401).json(createErrorResponse(401, 'Unauthorized'));
      return;
    }
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const email = decodedCredentials.split(':')[0];
    logger.debug(`email: ${email}`); // email is the ownerId

    // check it the expand present and set to 1
    const isExpand = req.query.expand === '1';
    // get the fragment id if exist
    const ownerID = req.params.id;
    logger.debug(`isId: ${ownerID}`);
    logger.debug(`isExpand: ${isExpand}`);

    let fragments = []; // array of fragments for get all fragments
    let fragment = null; // fragment for get fragment by id
    let data = null; // data for get fragment by id

    // get all fragments for the user with all attributes
    if (isExpand) {
      fragments = await Fragment.byUser(email, isExpand);
    }
    // Gets an authenticated user's fragment data with the given id
    else if (ownerID) {
      fragment = await Fragment.byId(email, ownerID);
      fragment.data = await fragment.getData();
      data = Buffer.from(fragment.data).toString('utf-8');
      // get all fragments for the user with only id attribute
    } else {
      fragments = await Fragment.byUser(email, false);
    }

    // log all fragments attributes
    fragments.forEach((fragment) => {
      logger.debug(`fragment.id: ${fragment.id}`);
      logger.debug(`fragment.ownerId: ${fragment.ownerId}`);
      logger.debug(`fragment.type: ${fragment.type}`);
      logger.debug(`fragment.size: ${fragment.size}`);
      logger.debug(`fragment.created: ${fragment.created}`);
      logger.debug(`fragment.updated: ${fragment.updated}`);
    });

    // send the right response
    if (data) {
      res.status(200).json(
        createSuccessResponse({
          data,
        })
      );
    } else {
      res.status(200).json(
        createSuccessResponse({
          fragments: [...fragments],
        })
      );
    }
  } catch (err) {
    logger.error(`Error in GET /fragments: ${err}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
