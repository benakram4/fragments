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
      const email = 'user1@email.com'
      const hashEmail = hash(email)
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('test fragment 1'));
      const fragment2 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment2.save();
      await fragment2.setData(Buffer.from('test fragment 2'));

      // make the request
      const res = await request(app)
        .get('/v1/fragments?expand=1')
        .auth(email, 'password1');

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

    test("authenticated users get a fragments array pf id's", async () => {
      // create 2 fragments for the user
      const email = 'user2@email.com'
      const hashEmail = hash(email)
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
    test("Gets an authenticated user's fragment data with the given id", async () => {
      // create a fragment for the user
      const email = 'user2@email.com'
      const hashEmail = hash(email)
      const fragment1 = new Fragment({ ownerId: hashEmail, type: 'text/plain' });
      await fragment1.save();
      await fragment1.setData(Buffer.from('test fragment by id'));

      // get the data of the fragment
      fragment1.data = await fragment1.getData();

      // make the request
      const res = await request(app)
        .get(`/v1/fragments/${fragment1.id}`)
        .auth(email, 'password2');

      // check the response status code
      expect(res.statusCode).toBe(200);
      // check that only one piece of data is returned
      expect(Array.isArray(res.body)).toBe(false);
      // check the response body
      expect(res.body).toEqual(
        createSuccessResponse({
          data: Buffer.from(fragment1.data).toString('utf-8'),
        })
      );
    });
  });
});
