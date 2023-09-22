module.exports = {
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es2021: true,
    // Add this next line to configure ESLint for Jest, see:
    // https://eslint.org/docs/user-guide/configuring/language-options#specifying-environments
    jest: true,
  },
  globals: {
    process: 'readonly',
  },
  extends: 'eslint:recommended',
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {},
};
