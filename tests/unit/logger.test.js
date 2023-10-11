// src/logger.test.js

describe('Logger', () => {
  beforeEach(() => {
    delete process.env.LOG_LEVEL;
    jest.resetModules();
  });
  test('sets the log level to "info" if LOG_LEVEL is not specified', () => {
    const logger = require('../../src/logger');
    expect(logger.level).toBe('info');
  });

  test('sets the log level to the value of LOG_LEVEL if specified', () => {
    process.env.LOG_LEVEL = 'debug';
    const logger = require('../../src/logger');
    expect(logger.level).toBe('debug');
  });
});
