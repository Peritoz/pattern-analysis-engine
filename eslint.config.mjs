import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const isInBooleanContext = node => {
  let expression = node;

  while (expression.parent?.type === 'LogicalExpression') {
    expression = expression.parent;
  }

  const parent = expression.parent;

  return (
    (parent?.type === 'IfStatement' && parent.test === expression) ||
    (parent?.type === 'WhileStatement' && parent.test === expression) ||
    (parent?.type === 'DoWhileStatement' && parent.test === expression) ||
    (parent?.type === 'ForStatement' && parent.test === expression) ||
    (parent?.type === 'ConditionalExpression' && parent.test === expression)
  );
};

const localRules = {
  rules: {
    'prefer-boolean-constructor': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'require Boolean() rather than double negation for value coercion',
        },
        fixable: 'code',
        schema: [],
        messages: {
          preferBooleanConstructor: 'Use Boolean({{ expression }}) instead of double negation.',
        },
      },
      create(context) {
        const sourceCode = context.sourceCode;

        return {
          UnaryExpression(node) {
            if (
              node.operator !== '!' ||
              node.argument.type !== 'UnaryExpression' ||
              node.argument.operator !== '!' ||
              isInBooleanContext(node)
            ) {
              return;
            }

            const coercedValue = node.argument.argument;
            const expression = sourceCode.getText(coercedValue);

            context.report({
              node,
              messageId: 'preferBooleanConstructor',
              data: { expression },
              fix: fixer => fixer.replaceText(node, `Boolean(${expression})`),
            });
          },
        };
      },
    },
  },
};

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
    plugins: {
      local: localRules,
    },
    rules: {
      'local/prefer-boolean-constructor': 'error',
    },
  },
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
