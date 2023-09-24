describe('Auth', () => {
  test('throws an error when no authorization configuration is found', () => {
    process.env = {};
    expect(() => require('../../src/auth')).toThrow(
      'missing env vars: no authorization configuration found'
    );
  });
});
