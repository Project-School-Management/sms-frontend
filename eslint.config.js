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
            // app ne peut dépendre que de feature, data-access, ui, shared
            {
              sourceTag:            'type:app',
              onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:models', 'scope:shared'],
            },
            // feature peut dépendre de data-access, ui, models, shared
            {
              sourceTag:            'type:feature',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:ui', 'type:models', 'scope:shared'],
            },
            // data-access peut dépendre de models et shared uniquement
            {
              sourceTag:            'type:data-access',
              onlyDependOnLibsWithTags: ['type:models', 'scope:shared'],
            },
            // ui peut dépendre de models et shared uniquement
            {
              sourceTag:            'type:ui',
              onlyDependOnLibsWithTags: ['type:models', 'scope:shared'],
            },
            // shared peut dépendre de shared uniquement
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
      '@typescript-eslint/no-explicit-any':         'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars':          ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
