import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/playwright-report/**',
      'deliverables/output/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
    },
  },
  {
    files: ['rimss-api/src/**/*.ts', 'rimss-app/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { arguments: false, attributes: false } },
      ],
    },
  },
  // Architecture: the web app is layered; dependencies point downwards only.
  // modules -> (components, hooks, services, utils, types); the lower layers never import modules.
  {
    files: ['rimss-app/src/{services,hooks,utils,types,plugins}/**/*.{ts,tsx}'],
    ignores: ['**/*.test.*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules', '**/modules/**'],
              message: 'Lower layers must not depend on feature modules.',
            },
            {
              group: ['**/components', '**/components/**'],
              message: 'Non-UI layers must not depend on components.',
            },
          ],
        },
      ],
    },
  },
  // Code outside modules may only use a module through its public barrel (modules/<name>).
  {
    files: ['rimss-app/src/**/*.{ts,tsx}'],
    ignores: ['rimss-app/src/modules/**', '**/*.test.*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/*/*'],
              message: 'Import from the module barrel (modules/<name>).',
            },
          ],
        },
      ],
    },
  },
  // Feature modules are isolated from each other; share via components/services/hooks instead.
  ...['cart', 'productSearch', 'productShowcase'].map((name) => ({
    files: ['rimss-app/src/modules/' + name + '/**/*.{ts,tsx}'],
    ignores: ['**/*.test.*', '**/*.stories.*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['cart', 'productSearch', 'productShowcase']
                .filter((other) => other !== name)
                .flatMap((other) => [
                  ...(other === 'cart' ? [] : ['../../' + other]),
                  '../../' + other + '/**',
                  '../../../' + other + '/**',
                ]),
              message: 'Feature modules must not import each other.',
            },
          ],
        },
      ],
    },
  })),
  {
    files: ['**/*.{js,cjs}'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['deliverables/**/*.js'],
    rules: { '@typescript-eslint/no-unused-vars': 'warn' },
  },
  {
    files: ['rimss-app/public/push-sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
  {
    files: ['rimss-app/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
