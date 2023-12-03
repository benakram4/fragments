// test/unit/put.test.js

const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const logger = require('../../src/logger');

const username = 'user1@email.com';
const password = 'password1';

describe('PUT /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).put('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('fragment not found/does not exist', async () => {
    // Create a fragment
    const res = await request(app)
      .put('/v1/fragments/1234')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send('test put fragment');

    expect(res.statusCode).toBe(404);
  });

  test('updated type does not match original', async () => {
    // create a valid fragment
    const hashEmail = hash(username);
    const fragment = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
    await fragment.setData(Buffer.from('test fragment '));
    await fragment.save();

    // make the request
    const res = await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth(username, password)
      .set('Content-Type', 'application/json')
      .send({ data: 'test put fragment' });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Error in PUT, types do not match');
  });

  test('update a valid fragment', async () => {
    // create a valid fragment
    const hashEmail = hash(username);
    const fragment = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
    await fragment.setData(Buffer.from('old put fragment!'));
    await fragment.save();

    // introduce a delay to test the updated date
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // make the request to update the fragment
    const res = await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send('new put fragment');

    // get the updated fragment data for comparison
    const newData = await fragment.getData();

    // log the response body
    logger.debug(`PUT /v1/fragments response body: ${JSON.stringify(res.body, null, 2)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.created).not.toBe(res.body.fragment.updated);
    expect(res.body.fragment.id).toBe(fragment.id);
    expect(newData.toString()).not.toBe('old put fragment!');
    expect(newData.toString()).toBe('new put fragment');
  });
});
