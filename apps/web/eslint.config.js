import { FlatCompat } from '@eslint/eslintrc';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import parser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import babelParser from '@babel/eslint-parser';
import perfectionist from 'eslint-plugin-perfectionist';
import perfectionistRules from '../../eslint/perfectionistRules.config.mjs';
import * as eslintImportResolverTypescript from 'eslint-import-resolver-typescript';

import reactPerf from 'eslint-plugin-react-perf';
import importPlugin from 'eslint-plugin-import';
import boundaries from 'eslint-plugin-boundaries';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const compat = new FlatCompat({});

export default [
    ...compat.config({
        extends: [
            'google',
            'plugin:@typescript-eslint/recommended',

        ],
    }),
    {
        plugins: {
            prettier: eslintPluginPrettier,
            '@typescript-eslint': typescriptEslint,

            'react-perf': reactPerf,
            import: importPlugin,
        },
        rules: {
            'require-jsdoc': 'off',
            'valid-jsdoc': 'off',
            'new-cap': 'off',
            '@typescript-eslint/no-empty-object-type': 'off'
        },
    },
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '**/*.config.*',
            'eslint/**',
            '**/*.env',
            '**/*.yml',
            '.idea/**',
            '**/*.gitignore',
            '**/*.npmignore',
            '**/*.py',
            '**/*.json',
            '**/*.npmrc',
            '**/*.nvmrc',
            '**/*.md',
            '**/CODEOWNERS',
            'example/**',
            '.github/**',
            'global.d.ts',
        ],
    },
    prettierConfig,
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        ignores: ['**/*.test.ts', 'scripts/**/*.ts', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            parser,
            parserOptions: {
                jsDocParsingMode: 'type-info',
                project: './tsconfig.eslint.json',
            },
            sourceType: 'module',
        },
        plugins: {
            perfectionist,
            eslintImportResolverTypescript,
        },
        rules: {
            quotes: ['error', 'single'],
            '@typescript-eslint/no-shadow': ['error'],
            'no-shadow': 'off',
            'no-underscore-dangle': [2, { allowAfterThis: true }],
            'no-use-before-define': [
                'error',
                { classes: false, functions: true, variables: true },
            ],
            'import/prefer-default-export': 'off',
            ...perfectionistRules,
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    ts: 'never',
                    tsx: 'never',
                },
            ]
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: ['./tsconfig.eslint.json'],
                },
                node: {
                    extensions: ['.js'],
                },
            },
        },
    },
    {
        files: ['test/**/*'],
        languageOptions: {
            ecmaVersion: 'latest',
            parser,
            parserOptions: {
                jsDocParsingMode: 'type-info',
                project: './tsconfig.test.json',
            },
            sourceType: 'module',
        },
        plugins: {
            perfectionist,
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            quotes: ['error', 'single'],
            'dot-notation': 'off',
            '@typescript-eslint/no-shadow': ['error'],
            'no-shadow': 'off',
            'no-underscore-dangle': [2, { allowAfterThis: true }],
            'no-use-before-define': [
                'error',
                { classes: false, functions: true, variables: true },
            ],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            ...perfectionistRules,
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'never',
                    jsx: 'never',
                    ts: 'never',
                    tsx: 'never',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: ['./tsconfig.eslint.json'],
                },
            },
        },
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        plugins: {
            perfectionist,
        },
        rules: {
            quotes: ['error', 'single'],
            ...perfectionistRules,
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'never',
                    jsx: 'never',
                },
            ]
        },
    },
    {
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    babelrc: false,
                    configFile: false,
                    presets: ['@babel/preset-env'],
                },
            },
        },
        plugins: {
            perfectionist,
        },
        rules: {
            quotes: ['error', 'single'],
            ...perfectionistRules,
            'no-underscore-dangle': 'off',
            'import/no-extraneous-dependencies': ['off', { devDependencies: true }],
            'import/prefer-default-export': 'off',
            'import/no-named-as-default': 'off',
            'import/no-named-as-default-member': 'off',
            'no-console': 'off',
            'no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-unused-vars': 'off',
            'import/extensions': 'off'
        },
    },
    {
        files: ['scripts/**/*.ts'],
        ignores: ['scripts/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            parser,
            parserOptions: {
                jsDocParsingMode: 'type-info',
                project: './tsconfig.eslint.json',
            },
            sourceType: 'module',
        },
        plugins: {
            perfectionist,
            eslintImportResolverTypescript,
        },
        rules: {
            quotes: ['error', 'single'],
            '@typescript-eslint/no-shadow': ['error'],
            'no-shadow': 'off',
            'no-underscore-dangle': [2, { allowAfterThis: true }],
            'no-use-before-define': [
                'error',
                { classes: false, functions: true, variables: true },
            ],
            'import/no-extraneous-dependencies': ['off', { devDependencies: true }],
            'no-console': 'off',
            'import/prefer-default-export': 'off',
            'no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            ...perfectionistRules,
            'import/extensions': 'off'
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: ['./tsconfig.json'],
                },
                node: {
                    extensions: ['.js'],
                },
            },
        },
    },
    {
        files: ['src/**/*.tsx', 'src/**/*.jsx'],
        plugins: {
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...jsxA11y.flatConfigs.recommended.rules,
            // Enforce strict hierarchy but allow some flexibility for existing components initially if needed,
            // but goal is strict compliance.
            'jsx-a11y/heading-has-content': 'error',
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/role-supports-aria-props': 'error',
            'jsx-a11y/role-has-required-aria-props': 'error',
        },
    },
    {
        // This allows us to directly "mutate" the state in action files.
        // Immer is used under the hood when importing actions into the redux
        // reducers, so it allows us to write code that appear to "mutate" state.
        files: ['src/store/**/actions/**/*.ts'],
        rules: {
            'no-param-reassign': [
                'error',
                {
                    props: true,
                    ignorePropertyModificationsFor: ['state'], // Allow 'state' mutation in Redux actions
                },
            ]
        },
    },
    {
        // This rules will prevent importing actions directly from the actions directory
        // The following rule provides an exception.
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            'react/display-name': 'off', // Disable react/display-name
            'react/function-component-definition': 'off', // Disable react/function-component-definition
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: '@/components/shared/CRMComponents',
                            importNames: ['InputField', 'TextAreaField', 'SelectField', 'ToggleField', 'Tabs', 'FieldGroup', 'ReadOnlyField', 'CRMComponents'],
                            message: 'These components are deprecated. Please use standard components from @/components/fields/* or @/components/shared/*.'
                        }
                    ],
                    patterns: [
                        {
                            group: ['src/store/**/actions', '../actions'], // Restrict import patterns for actions
                            message:
                                'Please import a redux slice and destructure the actions instead.',
                        },
                    ],
                },
            ]
        },
    },
    {
        // This rules specifically allows store actions to be imported into *Slice files.
        files: ['src/store/**/*Slice.ts'],
        rules: {
            '@typescript-eslint/no-restricted-imports': 'off', // Disable restricted imports for slice files
        },
    },
    {
        rules: {
            // This is a very helpful rule, however it is not correct all the time. There are instances where listening for every
            // dependency will cause problems. Developers should be encouraged to temporarily enable this rule when troubleshooting
            // dependencies for hooks such as useEffect and useCallback.
            'react-hooks/exhaustive-deps': 'off',
            // Optional react-perf rules for dependency-related optimization
            'react-perf/jsx-no-new-function-as-prop': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_'
                }
            ],
            'no-console': ['warn', { allow: ['warn', 'error'] }]
        },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        plugins: {
            boundaries,
        },
        settings: {
            'boundaries/include': ['src/**/*'],
            'boundaries/elements': [
                {
                    type: 'Test',
                    pattern: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**/*', 'src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/test/**/*'],
                    mode: 'full',
                    capture: ['root']
                },
                {
                    type: 'UI',
                    pattern: ['src/apps/**/*', 'src/components/**/*', 'src/os/**/*'],
                    mode: 'full'
                },
                {
                    type: 'State',
                    pattern: ['src/store/**/*'],
                    mode: 'full'
                },
                {
                    type: 'Service',
                    pattern: ['src/services/**/*'],
                    mode: 'full'
                },
                {
                    type: 'DB',
                    pattern: ['src/db/**/*'],
                    mode: 'full'
                },
                {
                    type: 'Server',
                    pattern: ['src/server/**/*'],
                    mode: 'full'
                },
                {
                    type: 'Lib',
                    pattern: ['src/lib/**/*'],
                    mode: 'full'
                },
                {
                    type: 'System',
                    pattern: ['src/system/**/*'],
                    mode: 'full'
                }
            ]
        },
        rules: {
            'boundaries/element-types': [
                'error',
                {
                    default: 'allow',
                    rules: [
                        {
                            from: 'UI',
                            allow: ['UI', 'State', 'Lib', 'System'],
                            disallow: ['Service', 'DB', 'Server'],
                            message: 'UI components cannot import Service, DB, or Server layers directly. Use State (Redux/Sagas) or tRPC hooks.'
                        },
                        {
                            from: 'State',
                            allow: ['State', 'Service', 'Lib', 'System'],
                            disallow: ['UI', 'DB', 'Server'],
                            message: 'State layer cannot import UI or DB directly. UI should remain pure, and DB usage should go through Services.'
                        },
                        {
                            from: 'Service',
                            allow: ['Service', 'DB', 'Lib', 'System'],
                            disallow: ['UI', 'State', 'Server'],
                            message: 'Services cannot import UI or State. Services should be stateless business logic.'
                        },
                        {
                            from: 'DB',
                            allow: ['DB', 'Lib'],
                            disallow: ['UI', 'State', 'Service', 'Server'],
                            message: 'DB layer must remain pure and only dependent on Libs.'
                        },
                        {
                            from: 'Server',
                            allow: ['Server', 'Service', 'DB', 'Lib'],
                            disallow: ['UI', 'State'],
                            message: 'Server code cannot import UI or Client State.'
                        },
                        {
                            from: 'Lib',
                            allow: ['Lib'],
                            disallow: ['UI', 'State', 'Service', 'DB', 'Server', 'System'],
                            message: 'Lib utils must be pure and definition-only.'
                        },
                        {
                            from: 'System',
                            allow: ['System', 'Service', 'DB', 'Lib', 'State'],
                            disallow: ['UI', 'Server'],
                            message: 'System layer handles cross-cutting concerns but should not import UI components.'
                        },
                        {
                            from: 'Test',
                            allow: ['UI', 'State', 'Service', 'DB', 'Server', 'Lib', 'System', 'Test'],
                            message: 'Tests can import anything.'
                        }
                    ]
                }
            ]
        }
    }
];