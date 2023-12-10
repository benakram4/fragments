// src/routes/api/get.js

// imports
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const sharp = require('sharp'); // for image processing
const { convert } = require('html-to-text');

module.exports = async (req, res) => {
  try {
    // get user email from auth header
    const email = req.user;
    logger.debug(`get email: ${email}`); // email is the ownerID

    // check it the expand present and set to 1
    const isExpand = req.query.expand === '1';
    // get the fragment id if exist
    const fragID = req.params.id;
    // get the file extension
    const ext = req.params.ext;
    logger.debug(`fragId: ${fragID}`);
    logger.debug(`isExpand: ${isExpand}`);
    logger.debug(`ext: ${ext}`);

    // holders for multiple fragments
    let fragments = []; // array of fragments for get all fragments

    // holders for single fragment
    let fragment = null; // fragment for get fragment by id
    let data = null; // data for get fragment by id

    // check if the request is for info
    let isInfoReq = false;
    if (req.path.includes('info')) {
      isInfoReq = true;
    }

    // get all fragments for the user with all attributes with expand flag
    if (isExpand) {
      fragments = await Fragment.byUser(email, isExpand);
      logger.debug(`GET/expand fragments: ${JSON.stringify(fragments, null, 2)}`);
      res.status(200).json(
        createSuccessResponse({
          fragments: [...fragments],
        })
      );
    }
    // Gets an authenticated user's fragment data with the given id
    else if (fragID) {
      if (isInfoReq) {
        // get fragment info when id/info
        fragment = await Fragment.byId(email, fragID);
        logger.debug(`GET/id/info fragment: ${JSON.stringify(fragment, null, 2)}`);
        logger.debug(`GET/id/info fragment.size: ${fragment.size}`);
        res.status(200).json(
          createSuccessResponse({
            ...fragment,
          })
        );
      } else {
        fragment = await Fragment.byId(email, fragID);
        fragment.data = await fragment.getData();

        if (!ext && fragment.type.startsWith('image/')) {
          res.setHeader('Content-Type', fragment.type);
          res.status(200).send(fragment.data);
        } else if (ext && fragment.type.startsWith('image/')) {
          // convert the image to the requested format
          const image = sharp(fragment.data);
          const outputFormat = ext;
          const outputBuffer = await image.toFormat(outputFormat).toBuffer();
          res.setHeader('Content-Type', `image/${outputFormat}`);
          res.status(200).send(outputBuffer);
        } else {
          data = Buffer.from(fragment.data).toString('utf-8');
          // If the extension is 'html' and the fragment's format is 'md', convert the data to HTML
          if (ext === 'html' && fragment.type === 'text/markdown') {
            data = md.render(data);
            res.setHeader('Content-Type', `text/html`);
            res.status(200).send(data);
          } else if (ext === 'txt' && fragment.type === 'text/html') {
            data = convert(data);
            res.setHeader('Content-Type', `text/plain`);
            res.status(200).send(data);
          } else if (ext === 'txt' && fragment.type === 'application/json') {
            data = Buffer.from(fragment.data).toString('utf-8');
            res.setHeader('Content-Type', `text/plain`);
            res.status(200).send(data);
          } else {
            // set the content-type header //  this is for all other cases like text/plain and application/json
            res.setHeader('Content-Type', fragment.type);
            res.status(200).send(data);
          }
        }
      }
      // get all fragments for the user with only id attribute
    } else {
      fragments = await Fragment.byUser(email, false);
      logger.debug(`GET fragments: ${JSON.stringify(fragments, null, 2)}`);
      res.status(200).json(
        createSuccessResponse({
          fragments: [...fragments],
        })
      );
    }
  } catch (err) {
    logger.error(`Error in GET /fragments: ${err}`);
    res.status(404).json(createErrorResponse(404, err));
  }
};
