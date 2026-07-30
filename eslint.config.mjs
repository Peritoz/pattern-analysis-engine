import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', '__tests__/coverage/', 'node_modules/'],
  },
  {
    files: ['*.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
      },
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/libs/engine/query_interpreter/ohm_interpreter/semantics/semantics.ts'],
    rules: {
      // Ohm semantic actions must retain parameters for every grammar production.
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    },
  },
  {
    rules: {
      // The library exposes dynamic graph properties and parser semantic values.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  eslintConfigPrettier,
);
