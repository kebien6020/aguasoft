import js from '@eslint/js'
import ts from 'typescript-eslint'

export default ts.config(
  {
    ignores: ['dist/**/*', 'node_modules/**/*'],
  },
  js.configs.recommended,
  ts.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
    },
    plugins: {
      'typescript-eslint': ts,
    },
    files: ['dist/**/*.{js,ts,mjs}'],
    rules: {
      // Disable some typescript rules
      '@typescript-eslint/no-floating-promises': 'off', // Annoying
      '@typescript-eslint/unbound-method': 'off', // Giving false negatives with useFormikContext

      // Base js rules
      indent: ['error', 2, { flatTernaryExpressions: true }],
      quotes: ['error', 'single'],
      'quote-props': ['error', 'as-needed'],
      semi: ['error', 'never'],
      curly: ['error', 'multi-or-nest', 'consistent'],
      'dot-location': ['error', 'property'],
      eqeqeq: 'error',
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-implicit-coercion': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'block-spacing': 'error',
      'brace-style': 'error',
      'spaced-comment': 'error',
      'no-const-assign': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'no-console': 'off',
      'prefer-const': 'error',

      // Style rules
      'array-bracket-spacing': ['error', 'never'],
      'array-bracket-newline': ['error', { multiline: true }],
      'array-element-newline': ['error', 'consistent'],
      'object-curly-spacing': ['error', 'always'],
      'object-curly-newline': ['error', { consistent: true, multiline: true }],
      'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      'template-curly-spacing': ['error', 'never'],
      'comma-spacing': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'comma-style': ['error', 'last'],
      'space-infix-ops': ['error'],
      'operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
      'space-unary-ops': ['error'],
      'space-in-parens': ['error'],
      'no-multi-spaces': ['error'],
      'key-spacing': ['error'],
      'dot-notation': ['error'],
      'max-len': [
        'error', {
          code: 120,
          tabWidth: 2,
          comments: 80,
          ignoreComments: false,
          ignorePattern: '^\\s+\\*\\s+@',
          ignoreTrailingComments: true,
          ignoreStrings: true,
          ignoreUrls: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      complexity: ['error', 15],
    },
  },
)
