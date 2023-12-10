// tests/unit/get.test.js

const request = require('supertest');
const hash = require('../../src/hash');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const { createSuccessResponse } = require('../../src/response');
const logger = require('../../src/logger');

describe('GET /v1/fragments', () => {
  describe('Unauthenticated requests return 401', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', async () =>
      await request(app).get('/v1/fragments').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', async () =>
      await request(app)
        .get('/v1/fragments')
        .auth('invalid@email.com', 'incorrect_password')
        .expect(401));
  });

  describe('GET all Fragments', () => {
    // Using a valid username/password pair should give a success result with a .fragments array
    test('authenticated users get a fragments array with expand flag', async () => {
      // create 2 fragments for the user
      const email = 'user1@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('test fragment 1'));
      const fragment2 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment2.save();
      await fragment2.setData(Buffer.from('test fragment 2'));

      // make the request
      const res = await request(app).get('/v1/fragments?expand=1').auth(email, 'password1');

      // get the host header: res.req.getHeader('host')
      const host = res.req.getHeader('host');
      logger.debug(`host: ${host}`);

      // add each for fragment to the fragments array
      const fragments = [];
      fragments.push(fragment1);
      fragments.push(fragment2);
      logger.debug(`fragments: ${JSON.stringify(fragments, null, 2)}`);

      // check the response status code
      expect(res.statusCode).toBe(200);
      // check the response body
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
      expect(res.body.fragments.length).toBe(fragments.length);
      // check all the fragment attributes
      expect(res.body).toEqual(
        createSuccessResponse({
          fragments: [...fragments],
        })
      );
    });

    test("authenticated users get a fragments array of id's", async () => {
      // create 2 fragments for the user
      const email = 'user2@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('test fragment 1'));
      const fragment2 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment2.save();
      await fragment2.setData(Buffer.from('test fragment 2'));

      // add each for fragment to the fragments array
      const fragments = [];
      fragments.push(fragment1.id);
      fragments.push(fragment2.id);

      const res = await request(app).get('/v1/fragments').auth(email, 'password2');

      // check the response status code
      expect(res.statusCode).toBe(200);
      //
      // check the response body
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
      expect(res.body.fragments.length).toBe(2);
      // check all the fragment attributes using the fragments array with spread operator
      expect(res.body).toEqual(
        createSuccessResponse({
          fragments: [...fragments],
        })
      );
    });
  });

  describe('GET Fragment by id', () => {
    test("Gets an authenticated user's fragment row data with the given id", async () => {
      // create a fragment for the user
      const email = 'user2@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/plain; charset=utf-8' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('test fragment by id'));

      // get the data of the fragment
      fragment1.data = await fragment1.getData();
      // log the type
      logger.debug(`yyy fragment1.type: ${fragment1.type}`);

      // make the request
      const res = await request(app).get(`/v1/fragments/${fragment1.id}`).auth(email, 'password2');

      // check the response status code
      expect(res.statusCode).toBe(200);

      // check the response body
      expect(res.text).toBe('test fragment by id');
      // check Content-Type header
      logger.debug(`res.headers.content-type: ${res.headers['content-type']}`);
      expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    });

    test('no such fragment exists, returns an HTTP 404 with an appropriate error message', async () => {
      const email = 'user2@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment1.save();

      const fakeFragId = 'xxxxxxxx-e26c-4bf5-914c-c62d0b9ac0a2';

      // make the request
      const res = await request(app).get(`/v1/fragments/${fakeFragId}`).auth(email, 'password2');

      expect(res.statusCode).toBe(404);
      // check that error has a message
      expect(res.body.error).toBeTruthy();
    });
  });

  describe('GET Fragment by id/info', () => {
    test("Gets an authenticated user's fragment metadata  with the given id", async () => {
      // create a fragment for the user
      const email = 'user2@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('test fragment by id/info'));

      // make the request
      const res = await request(app)
        .get(`/v1/fragments/${fragment1.id}/info`)
        .auth(email, 'password2');

      logger.debug(`GET info res.body: ${JSON.stringify(res.body, null, 2)}`);
      // check the response status code
      expect(res.statusCode).toBe(200);
      logger.debug(`GET info fragnemt1: ${JSON.stringify(fragment1, null, 2)}`);
      // check the response body
      expect(res.body.status).toBe('ok');
      // check all the fragment attributes using the fragments array with spread operator
      expect(res.body).toEqual(
        createSuccessResponse({
          ...fragment1,
        })
      );
    });

    test('no such fragment exists, returns an HTTP 404 with an appropriate error message', async () => {
      const email = 'user2@email.com';

      const fakeFragId = 'xxxxxxxx-e26c-4bf5-914c-c62d0b9ac0a2';

      // make the request
      const res = await request(app)
        .get(`/v1/fragments/${fakeFragId}/info`)
        .auth(email, 'password2');

      expect(res.statusCode).toBe(404);
      // check that error has a message
      expect(res.body.error).toBeTruthy();
    });
  });

  describe('GET Fragment by id.ext', () => {
    test("Gets an authenticated user's fragment data with the given id and extension, md to html", async () => {
      // create a fragment for the user
      const email = 'user2@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/markdown' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('# test fragment by id.ext md to html'));

      // make the request for the HTML version of the fragment
      const res = await request(app)
        .get(`/v1/fragments/${fragment1.id}.html`)
        .auth(email, 'password2');

      logger.debug(`GET ext md-html res: ${JSON.stringify(res, null, 2)}`);
      // check the response status code
      expect(res.statusCode).toBe(200);

      // check that the response contains the expected HTML
      expect(res.text).toBe('<h1>test fragment by id.ext md to html</h1>\n');
      // check Content-Type header
      logger.debug(`res.headers.content-type: ${res.headers['content-type']}`);
      expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    });

    test("Gets an authenticated user's fragment data with the given id and extension, html to txt", async () => {
      // create a fragment for the user
      const email = 'user2@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/html' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('<h1>test fragment by id.ext html to txt</h1>'));

      // make the request for the text version of the fragment
      const res = await request(app)
        .get(`/v1/fragments/${fragment1.id}.txt`)
        .auth(email, 'password2');

      logger.debug(`GET ext html-txt res: ${JSON.stringify(res, null, 2)}`);

      // check the response status code
      expect(res.statusCode).toBe(200);

      // check that the response contains the expected text
      expect(res.text).toBe('TEST FRAGMENT BY ID.EXT HTML TO TXT');
      // check Content-Type header
      logger.debug(`res.headers.content-type: ${res.headers['content-type']}`);
      expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    });

    test("Gets an authenticated user's fragment data with the given id and extension, json to txt", async () => {
      // create a fragment for the user
      const email = 'user2@email.com';
      const hashEmail = hash(email);
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'application/json' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('{"test": "fragment by id.ext json to txt"}'));

      // make the request for the text version of the fragment
      const res = await request(app)
        .get(`/v1/fragments/${fragment1.id}.txt`)
        .auth(email, 'password2');

      logger.debug(`GET ext json-txt res: ${JSON.stringify(res, null, 2)}`);

      // check the response status code
      expect(res.statusCode).toBe(200);

      // check that the response contains the expected text
      expect(res.text).toBe('{"test": "fragment by id.ext json to txt"}');
      // check Content-Type header
      logger.debug(`res.headers.content-type: ${res.headers['content-type']}`);
      expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    });
  });
});
