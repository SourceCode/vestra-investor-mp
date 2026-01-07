import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const tsconfig = require('./tsconfig.json');
import { pathsToModuleNameMapper } from 'ts-jest';

const rootDir = '<rootDir>';

/** Filter out @manpow/nw-data-definitions. When another package such as @manpow/nw-sns-dispatch-service has imported
 *  @manpow/nw-data-definitions, the resolved paths for the marketplace-client project and the @manpow/nw-sns-dispatch-service
 *  do not align. This causes errors when Jest interprets the imports. Removing the entry from the tsconfig paths prior
 *  to instantiating the tests resolves that conflict.
 */
const filteredPaths = Object.fromEntries(
    Object.entries(tsconfig.compilerOptions.paths).filter(
        ([key]) => !key.startsWith('@manpow/nw-data-definitions'),
    ),
);

// Babel configuration for Jest only (moved from babel.config.cjs)
const babelConfig = {
    presets: [
        ['@babel/preset-env', {
            targets: { node: 'current' },
            modules: 'commonjs'
        }],
        [
            '@babel/preset-typescript',
            {
                tsconfig: './tsconfig.test.json',
            },
        ],
        [
            '@babel/preset-react',
            {
                runtime: 'automatic', // Use "automatic" for React 17+ JSX transform
            },
        ],
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-transform-class-properties', { loose: true }],
        'babel-plugin-transform-import-meta',
    ],
};

const sharedConfig = {
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    // Memory optimization settings to prevent heap out of memory
    maxWorkers: 1, // Enforce sequential execution to prevent database race conditions
    workerIdleMemoryLimit: '512MB', // Restart workers if they exceed memory limit
    transform: {
        // Use inline babel config instead of external file
        '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', babelConfig],
        '^.+\\.svg$': 'jest-transform-stub', // Stub out SVG imports
    },
    transformIgnorePatterns: ['node_modules/(?!(@manpow|@mui|uuid|superjson|copy-anything|is-what|react-syntax-highlighter|vfile|vfile-message|unist-util-stringify-position|unified|bail|trough|remark-parse|remark-rehype|remark-gfm|mdast-util-from-markdown|mdast-util-to-string|micromark|decode-named-character-reference|character-entities|property-information|hast-util-whitespace|space-separated-tokens|comma-separated-tokens|pretty-bytes|ccount|escapestringregexp|markdown-table|trim-lines|debounce)/)'],
    moduleNameMapper: {
        // Mock docsLoader to avoid import.meta.glob issues (Must be before alias mappings)
        '^@/apps/documentation/docsLoader$': '<rootDir>/src/apps/documentation/__mocks__/docsLoader.ts',
        '^@/db/loader$': '<rootDir>/src/db/__mocks__/loader.ts',
        '^@/lib/utils/env$': '<rootDir>/src/lib/utils/__mocks__/env.ts',
        'react-syntax-highlighter/dist/esm/styles/prism': 'identity-obj-proxy',
        'remark-gfm': '<rootDir>/src/__mocks__/remark-gfm.ts',
        ...pathsToModuleNameMapper(filteredPaths, {
            prefix: rootDir,
        }),
        // Mock CSS imports
        '^.+\\.css$': 'identity-obj-proxy',
        // Mock SVG imports
        '^.+\\.svg$': 'jest-transform-stub',
        '^.+\\.wasm$': 'jest-transform-stub',

        // Mock other static assets if needed
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json',
        },
        __APP_VERSION__: '3.0.61',
    },
    coverageDirectory: './coverage',
};

const jestConfig = {
    rootDir: '.',
    testTimeout: 30000, // 30 seconds max for all tests
    coverageReporters: ['json-summary', 'text', 'lcov'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!public/**/*', // Exclude public directory
        '!**/index.ts', // Exclude all index.ts files
        '!**/index.tsx', // Exclude all index.tsx files
        '!src/**/consts/**/*.{ts,tsx}', // Exclude files in consts directories
        '!src/**/enums/**/*.{ts,tsx}', // Exclude files in enums directories
        '!src/**/interfaces/**/*.{ts,tsx}', // Exclude files in interfaces directories
        '!src/**/types/**/*.{ts,tsx}', // Exclude files in types directories
        '!src/**/*consts.{ts,tsx}', // Exclude files named consts.ts or consts.tsx
        '!src/**/*enums.{ts,tsx}', // Exclude files named enums.ts or enums.tsx
        '!src/**/*interfaces.{ts,tsx}', // Exclude files named interfaces.ts or interfaces.tsx
        '!src/**/*types.{ts,tsx}', // Exclude files named types.ts or types.tsx
        '!src/**/*styles.{ts,tsx}', // Exclude files named types.ts or types.tsx
        '!src/app/global-error.tsx', // Exclude global error boundary,
        /** This section is intended to ignore files that were only used for the POC and demo purposes. Remove these later. */
        '!src/store/featureFlags/selectors/SampleFlags/**', //remove this once the test feature flags are removed
        '!src/components/common/LazyLoadedComponent.tsx', // remove once the example is no longer needed
        '!src/components/common/GenericResponsiveComponent/**', //remove once the example is no longer needed
        '!src/components/app/AgentAuthenticator/**', // Agent-specific authenticator (kept separate)
    ],
    displayName: 'Unit Tests',
    coverageThreshold: {
        global: {
            statements: 15,
            branches: 15,
            functions: 15,
            lines: 15,
        },
    },
    projects: [
        // Configuration for server-side tests
        {
            ...sharedConfig,
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: ['**/*.server.test.[jt]s?(x)'],
            setupFiles: [`${rootDir}/jest.setup.env.ts`],
            setupFilesAfterEnv: [`${rootDir}/jest.setup.server.ts`],
            collectCoverageFrom: [],
        },
        // Configuration for client-side tests
        {
            ...sharedConfig,
            displayName: 'client',
            testEnvironment: 'jsdom',
            testMatch: ['**/*.client.test.[jt]s?(x)'],
            setupFiles: [`${rootDir}/jest.setup.env.ts`],
            setupFilesAfterEnv: [`${rootDir}/jest.setup.client.ts`],
            moduleNameMapper: {
                ...sharedConfig.moduleNameMapper,
                // Mock data-source to prevent browser errors
                '^@/db/data-source$': '<rootDir>/src/db/__mocks__/data-source.ts',
                // Mock services that use AppDataSource to prevent browser errors
                '^@/services/crm/contact-service$': '<rootDir>/src/services/crm/__mocks__/contact-service.ts',
                '^@/services/crm/deal-service$': '<rootDir>/src/services/crm/__mocks__/deal-service.ts',
                '^@/services/triggers/ContactTriggerService$': '<rootDir>/src/services/triggers/__mocks__/ContactTriggerService.ts',
                '^@/services/workflow/WorkflowService$': '<rootDir>/src/services/workflow/__mocks__/WorkflowService.ts',
                '^@/services/payroll-service$': '<rootDir>/src/services/__mocks__/payroll-service.ts',
            },
        },
        // Configuration for integration tests that use jsdom (determined by @jest-environment comment)
        {
            ...sharedConfig,
            displayName: 'integration',
            testEnvironment: 'jsdom',
            testMatch: [
                '**/*.integration.test.[jt]s?(x)',
            ],
            setupFiles: [`${rootDir}/jest.setup.env.ts`],
            setupFilesAfterEnv: [`${rootDir}/jest.setup.client.ts`],
            moduleNameMapper: {
                ...sharedConfig.moduleNameMapper,
                // Mock data-source to prevent browser errors
                '^@/db/data-source$': '<rootDir>/src/db/__mocks__/data-source.ts',
                // Mock services that use AppDataSource to prevent browser errors
                '^@/services/crm/contact-service$': '<rootDir>/src/services/crm/__mocks__/contact-service.ts',
                '^@/services/crm/deal-service$': '<rootDir>/src/services/crm/__mocks__/deal-service.ts',
                '^@/services/triggers/ContactTriggerService$': '<rootDir>/src/services/triggers/__mocks__/ContactTriggerService.ts',
                '^@/services/workflow/WorkflowService$': '<rootDir>/src/services/workflow/__mocks__/WorkflowService.ts',
                '^@/services/payroll-service$': '<rootDir>/src/services/__mocks__/payroll-service.ts',
            },
        },
        // Configuration for common tests (no .client or .server in name)
        {
            ...sharedConfig,
            displayName: 'common',
            testEnvironment: 'node',
            testMatch: [
                '**/*.test.[jt]s?(x)',
                '!**/*.client.test.[jt]s?(x)',
                '!**/*.server.test.[jt]s?(x)',
                '!**/*.integration.test.[jt]s?(x)',
            ],
            setupFiles: [`${rootDir}/jest.setup.env.ts`],
            setupFilesAfterEnv: [`${rootDir}/jest.setup.ts`],
        },
    ],
};

export default jestConfig;