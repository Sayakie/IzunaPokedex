/** @type {import('eslint').Linter.Config & { parserOptions: import('@typescript-eslint/parser').ParserOptions }} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: `${__dirname}/tsconfig.eslint.json`,
    tsConfigRootDir: './',
    ecmaVersion: 2019,
    ecmaFeatures: {
      impliedStrict: true
    },
    sourceType: 'module',
    extraFileExtensions: ['.mjs'],
    warnOnUnsupportedTypeScriptVersion: true
  },
  env: {
    es2020: true,
    node: true
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    semi: 'off',
    '@typescript-eslint/semi': [
      'error',
      'never',
      { beforeStatementContinuationChars: 'always' }
    ],
    '@typescript-eslint/no-non-null-assertion': 'off'
  }
}
