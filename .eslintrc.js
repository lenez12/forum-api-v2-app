module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  ignorePatterns: [
    'node_modules/*',
    'coverage/*',
    '.gitignore',
    'package-lock.json',
    'package.json',
    'eslintrc.js',
  ],
  rules: {
    'linebreak-style': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
  },
};
