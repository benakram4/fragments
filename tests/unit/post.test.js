// tests\unit\post.test.js

const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');
const sharp = require('sharp');
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

    // Log the response
    logger.info('POST /v1/fragments response');
    logger.info(`status: ${res.statusCode}`);
    logger.info(`headers: ${JSON.stringify(res.headers, null, 2)}`);
    logger.info(`body: ${JSON.stringify(res.body, null, 2)}`);

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
    // check the content-location header
    expect(res.headers['location']).toEqual(
      expect.stringContaining(`/v1/fragments/${res.body.fragment.id}`)
    );
    // check the content-type header
    expect(res.body.fragment.type).toEqual(expect.stringContaining('text/plain'));

    // This checks all all of the properties of the response body
    expect(res.body).toEqual(retResponse);
  });

  test('Auth user post an image type', async () => {
    // Create a small PNG image with sharp
    const imgData = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .png()
    .toBuffer();

    // Create a fragment
    const res = await request(app)
      .post('/v1/fragments')
      .auth(username, password)
      .set('Content-Type', 'image/png')
      .send(imgData);

    // Log the response
    logger.info('POST Image /v1/fragments response');
    logger.info(`status: ${res.statusCode}`);
    logger.info(`headers: ${JSON.stringify(res.headers, null, 2)}`);
    logger.info(`image body: ${JSON.stringify(res.body, null, 2)}`);

    expect(res.statusCode).toBe(201);
    // check the content-location header
    expect(res.headers['location']).toEqual(
      expect.stringContaining(`/v1/fragments/${res.body.fragment.id}`)
    );
    // check the content-type header
    expect(res.body.fragment.type).toEqual(expect.stringContaining('image/png'));
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
