const nx      = require('@nx/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.nx/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow:                         ['^.*/environments/.*$'],
          depConstraints: [
            // app dépend de feature, layout, shared
            {
              sourceTag:            'type:app',
              onlyDependOnLibsWithTags: ['type:feature', 'type:layout', 'type:data-access', 'type:ui', 'type:models', 'scope:shared'],
            },
            // layout dépend de shared et core uniquement — jamais de */data-access métier
            {
              sourceTag:            'type:layout',
              onlyDependOnLibsWithTags: ['type:ui', 'type:models', 'scope:shared', 'type:core'],
            },
            // core dépend de shared uniquement
            {
              sourceTag:            'type:core',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // feature dépend de data-access, ui, models, shared
            {
              sourceTag:            'type:feature',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:ui', 'type:models', 'scope:shared'],
            },
            // data-access dépend de models et shared uniquement
            {
              sourceTag:            'type:data-access',
              onlyDependOnLibsWithTags: ['type:models', 'scope:shared'],
            },
            // ui dépend de models et shared uniquement
            {
              sourceTag:            'type:ui',
              onlyDependOnLibsWithTags: ['type:models', 'scope:shared'],
            },
            // shared dépend de shared uniquement
            {
              sourceTag:            'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.base.json', 'apps/*/tsconfig.app.json', 'libs/*/*/tsconfig.lib.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any':              'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars':               ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
