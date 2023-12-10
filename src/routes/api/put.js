// src/routes/api/put.js

const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  // get user email from auth header
  const email = req.user;
  logger.debug(`PUT get email: ${email}`);

  const fragID = req.params.id;
  logger.debug(`PUT fragId: ${fragID}`);

  // get the type from the request
  const { type } = contentType.parse(req);
  logger.debug(`PUT contentType.parse(req): ${type}`);

  // get the body from the request
  const data = req.body;
  logger.debug(`PUT req.body: ${data}`);

  try {
    // get a fragment with a given id
    const fragment = await Fragment.byId(email, fragID);
    logger.debug(`PUT fragments: ${JSON.stringify(fragment, null, 2)}`);

    if (fragment.type !== type) {
      logger.error(`Error in PUT /fragment: types are not the same, ${fragment.type} | ${type}`);
      res.status(400).json(createErrorResponse(400, `Error in PUT, types do not match`));
    } else {
      // update the fragment data
      await fragment.setData(data);

      // save the fragment to db
      await fragment.save();
      logger.debug(`PUT fragment saved`, JSON.stringify(fragment, null, 2));

      // send the response
      res.status(200).json(createSuccessResponse({ fragment }));
    }
  } catch (err) {
    logger.error(`Error in PUT /fragments: ${err}`);
    res.status(404).json(createErrorResponse(404, err));
  }
};
