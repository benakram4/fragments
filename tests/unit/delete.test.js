const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../src/response');
const logger = require('../../src/logger');

const username = 'user1@email.com';
const password = 'password1';

describe('DELETE /v1/fragments', () => {
  test("delete a fragment and return a success response", async () => {
    // Create a fragment
    const hashEmail = hash(username);
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send('test fragment');

    // get the fragment id from the response
    const fragmentId = postRes.body.fragment.id;

    logger.debug(`fragment/delete fragment.id: ${fragmentId}`)

    // make the request
    const res = await request(app).delete(`/v1/fragments/${fragmentId}`).auth(username, password);

    // check the response status code
    expect(res.statusCode).toBe(200);
    // check the response body
    expect(res.body.status).toBe('ok');
    expect(res.body).toEqual(createSuccessResponse());

    // check the fragment was deleted;
    await expect(Fragment.byId(hashEmail, fragmentId)).rejects.toThrow();
  }
  );

  test("return 404 when fragment not found", async () => {
    // make the request
    const res = await request(app).delete(`/v1/fragments/123`).auth(username, password);

    // check the response status code
    expect(res.statusCode).toBe(404);
    // check the response body
    expect(res.body.status).toBe('error');
    expect(res.body).toEqual(createErrorResponse(404, 'Fragment with id 123 not found'));
  });
});
