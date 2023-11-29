const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  const ownerID = req.user;
  const fragmentID = req.params.id;
  try {
    logger.debug(`DELETE /fragments/${fragmentID}, ownerID: ${ownerID}`);
    const fragment = await Fragment.byId(ownerID, fragmentID);
    logger.debug(`fragment to be deleted: ${JSON.stringify(fragment, null, 2)}`);
    await Fragment.delete(ownerID, fragmentID);
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error(`Error in DELETE /fragments: ${err}`);
    res.status(404).json(createErrorResponse(404, `Fragment with id ${fragmentID} not found`));
  }
};
