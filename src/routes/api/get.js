// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  // Probably will need to identify the user id stored in the JWT(session, token)
  // fetch other data about the user ?
  // instead of responding with an empty array, probably send some data about the user
  res.status(200).json({
    status: 'ok',
    fragments: [],
  });
};