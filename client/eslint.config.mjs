import js from '@eslint/js'
import ts from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactCompiler from 'eslint-plugin-react-compiler'

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*'],
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    // TODO: On version 5.2.0 of the plugin, there's a recommended config
    // in the package
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  reactCompiler.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
    },
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
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
      '@typescript-eslint/no-unused-vars': [
        'off', {
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
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
    },
  },
]
