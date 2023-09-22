// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

// Unit test that check the 404 handler
describe('GET /some-fake-url', () => {
  // if the request to the fake url fail, it should be 404
  test('should return HTTP 404 response', async () => {
    const res = await request(app).get('/some-fake-url');
    expect(res.statusCode).toBe(404);
  });
});
