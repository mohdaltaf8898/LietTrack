import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';

// JSX component references are not ordinary Identifier nodes to ESLint's core rule.
const jsxUsage = {
  rules: {
    'jsx-usage': {
      create(context) {
        return {
          JSXOpeningElement(node) {
            context.sourceCode.markVariableAsUsed('React', node);
            let name = node.name;
            while (name.type === 'JSXMemberExpression') name = name.object;
            if (name.type === 'JSXIdentifier' && /^[A-Z]/.test(name.name)) context.sourceCode.markVariableAsUsed(name.name, node);
          },
          JSXFragment(node) { context.sourceCode.markVariableAsUsed('React', node); },
        };
      },
    },
  },
};
export default [
  { ignores: ['dist/**', 'node_modules/**', '.agents/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node, ...globals.serviceworker } },
    plugins: { local: jsxUsage, 'react-hooks': hooks },
    rules: { 'local/jsx-usage': 'error', 'react-hooks/rules-of-hooks': 'error' },
  },
];
