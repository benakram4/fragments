// tests\unit\post.test.js

const request = require('supertest');
const app = require('../../src/app');
// const { Fragment } = require('../../src/model/fragment');
const logger = require('../../src/logger');
const { createErrorResponse, createSuccessResponse } = require('../../src/response');

const username = 'user1@email.com';
const password = 'password1';

describe('POST /fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).post('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('Auth user create a fragment', async () => {
    // Create a fragment
    const res = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'text/plain')
      .send('test fragment');
    logger.debug({
      status: res.statusCode,
      headers: res.headers,
      body: res.body,
    });
    const retResponse = createSuccessResponse({
      fragment: {
        id: res.body.fragment.id,
        ownerId: res.body.fragment.ownerId,
        size: res.body.fragment.size,
        type: res.body.fragment.type,
        created: res.body.fragment.created,
        updated: res.body.fragment.updated,
        links: res.body.fragment.links,
      },
    });
    expect(res.statusCode).toBe(201);
    // This checks all all of the properties of the response body
    expect(res.body).toEqual(retResponse);
    // bellow is just an example of how to check a single property
    // expect(res.body.status).toBe('ok');
    // expect(res.body.fragment.id).toBeDefined();
    // expect(res.body.fragment.ownerId).toBe(username);
    // expect(res.body.fragment.type).toBe('text/plain');
    // expect(res.body.fragment.size).toEqual(Buffer.byteLength('test fragment'));
    // expect(res.body.fragment.created).toBeDefined();
    // expect(res.body.fragment.updated).toBeDefined();
    // expect(res.body.fragment.links.self).toEqual(expect.stringContaining(`/v1/fragments/${res.body.fragment.id}`));
  });

  test('unsupported media type returns 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'application/msword') // not supported
      .send('test fragment');
    const retResponse = createErrorResponse(415, 'Unsupported Media Type');
    expect(res.statusCode).toBe(415);
    expect(res.body).toEqual(retResponse);
  });

  test('invalid data returns 500', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', null) // invalid
      .send(null); // send invalid data

    expect(res.statusCode).toBe(500);
  });
});
