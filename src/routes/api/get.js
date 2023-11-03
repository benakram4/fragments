// src/routes/api/get.js

// imports
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // get user email from auth header
    const email = req.user;
    logger.debug(`get email: ${email}`); // email is the ownerId

    // check it the expand present and set to 1
    const isExpand = req.query.expand === '1';
    // get the fragment id if exist
    const ownerID = req.params.id;
    // get the file extension
    const ext = req.params.ext;
    logger.debug(`isId: ${ownerID}`);
    logger.debug(`isExpand: ${isExpand}`);
    logger.debug(`ext: ${ext}`);

    // holders for multiple fragments
    let fragments = []; // array of fragments for get all fragments

    // holders for single fragment
    let fragment = null; // fragment for get fragment by id
    let data = null; // data for get fragment by id
    let isInfoReq = false; // check if the request is for info
    if (req.path.includes('info')) {
      isInfoReq = true;
    }

    // get all fragments for the user with all attributes with expand flag
    if (isExpand) {
      fragments = await Fragment.byUser(email, isExpand);
      logger.debug(`GET/expand fragments: ${JSON.stringify(fragments, null, 2)}`);
    }
    // Gets an authenticated user's fragment data with the given id
    else if (ownerID) {
      if (isInfoReq) {
        // get fragment info when id/info
        fragment = await Fragment.byId(email, ownerID);

        logger.debug(`GET/id/info fragment: ${JSON.stringify(fragment, null, 2)}`);
      } else {
        logger.debug(`GET/id xxx ownerID: ${ownerID}`);
        fragment = await Fragment.byId(email, ownerID);
        fragment.data = await fragment.getData();
        logger.debug(`GET/id fragment.data: ${fragment.data}`);
        data = Buffer.from(fragment.data).toString('utf-8');
        logger.debug(`GET/id data: ${data}`);
        // If the extension is 'html' and the fragment's format is 'md', convert the data to HTML
        if (ext === 'html' && fragment.type === 'text/markdown') {
          logger.debug(`Before GET/id.ext data: ${data}`);
          data = md.render(data);
          logger.debug(`After GET/id.ext data: ${data}`);
        }
      }
      // get all fragments for the user with only id attribute
    } else {
      fragments = await Fragment.byUser(email, false);
      logger.debug(`GET fragments: ${JSON.stringify(fragments, null, 2)}`);
    }

    // send the right response
    if (data && !isInfoReq) {
      if (ext) {
        res.status(200).send(data);
      } else {
        res.status(200).json(
          createSuccessResponse({
            data,
          })
        );
      }
    } else if (isInfoReq) {
      res.status(200).json(
        createSuccessResponse({
          ...fragment,
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
    logger.error(`Error in GET /fragments: ${err.message}`);
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
