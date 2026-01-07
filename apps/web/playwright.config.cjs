const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// ===========================================
// Environment-Based Configuration
// ===========================================
const isCI = !!process.env.CI;
const isHeaded = process.env.HEADED === 'true' || process.argv.includes('--headed');
const isDebug = process.env.PWDEBUG === '1' || process.argv.includes('--debug');
const slowMo = process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0;
const workers = process.env.WORKERS ? parseInt(process.env.WORKERS, 10) : undefined;

module.exports = defineConfig({
    // ===========================================
    // Test Discovery
    // ===========================================
    testDir: './tests/e2e',
    testMatch: '**/*.spec.{ts,cjs}',
    testIgnore: ['**/node_modules/**', '**/.git/**'],

    // ===========================================
    // Execution Settings
    // ===========================================
    fullyParallel: true,
    workers: workers ?? (isCI ? 4 : (isHeaded || isDebug ? 1 : undefined)),
    forbidOnly: isCI,
    retries: isCI ? 2 : (isHeaded || isDebug ? 0 : 0),
    timeout: isHeaded || isDebug ? 120_000 : 60_000,

    expect: {
        timeout: 10_000,
        toHaveScreenshot: {
            maxDiffPixels: 100,
        },
    },

    // ===========================================
    // Global Setup/Teardown
    // ===========================================
    globalSetup: require.resolve('./tests/e2e/global-setup.cjs'),
    globalTeardown: require.resolve('./tests/e2e/global-teardown.cjs'),

    // ===========================================
    // Reporters
    // ===========================================
    reporter: [
        ['list'],
        ['html', {
            outputFolder: 'playwright-report',
            open: process.env.CI ? 'never' : 'on-failure',
        }],
        ['junit', {
            outputFile: 'test-results/junit.xml',
            embedAnnotationsAsProperties: true,
        }],
        ['json', {
            outputFile: 'test-results/results.json',
        }],
    ],

    // ===========================================
    // Shared Settings for All Projects
    // ===========================================
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:5173',
        headless: isCI ? true : !isHeaded,
        launchOptions: {
            slowMo,
        },
        actionTimeout: isDebug ? 0 : 15_000,
        navigationTimeout: isDebug ? 0 : 30_000,
        trace: isHeaded ? 'on' : 'on-first-retry',
        screenshot: isHeaded ? 'on' : 'only-on-failure',
        video: isHeaded ? 'on' : (isCI ? 'on-first-retry' : 'off'),
        viewport: { width: 1920, height: 1080 },
        timezoneId: 'America/Chicago',
        locale: 'en-US',
        geolocation: { longitude: -97.7431, latitude: 30.2672 },
        permissions: ['geolocation'],
        extraHTTPHeaders: {
            'x-test-mode': 'true',
            'x-test-run-id': process.env.TEST_RUN_ID || `local-${Date.now()}`,
        },
        ignoreHTTPSErrors: true,
        storageState: process.env.CI
            ? 'playwright/.auth/user.json'
            : undefined,
    },

    // Inject global test flag for app to detect E2E environment
    globalSetup: require.resolve('./tests/e2e/global-setup.cjs'), // Reuse existing setup
    // Use an array of projects or modify the 'use' block?
    // 'use' covers all projects.
    // 'addInitScript' is not a direct property of 'use', but 'contextOptions'.
    // Actually, 'config.use' can't invoke addInitScript directly? 
    // Wait, typical way is to use 'config.projects' or 'test.beforeEach' in a fixture.
    // BUT we can use 'use.contextOptions' ?? No.
    // However, we can use a fixture that runs automatically.
    // OR we can just use `page.addInitScript` in a global fixture.
    // BUT simplest for now: Just modify OutputRouter to check for a value we CAN set.
    // Playwright sets `navigator.webdriver` = true.
    // But specific flag is better.
    // Let's use a separate fixture file that we verify loads.

    // WAIT! `playwright.config.js` allows `use: { ... }`. 
    // It doesn't support `addInitScript` directly in `use`.
    // Instead I can create a `test.beforeEach` in a global setup file? 
    // Or simpler: Use `tests/e2e/utils/base.fixture.cjs` if it exists.

    // Let's stick to modifying OutputRouter to check a specialized property that I inject via `page.evaluate` in tests?
    // That's tedious for 544 tests.

    // Alternate: `OutputRouter` checks `import.meta.env.MODE`. 
    // When running E2E against `npm run dev -- --mode test`?
    // `package.json` says `dev: "vite"`. `test:e2e` runs playwright which hits that dev server.
    // If I change `test:e2e` to run against a server started with `mode=test`?

    // Better: Edit `tests/e2e/specs/calendar/navigation.spec.cjs`, `admin/console.spec.cjs` etc is tedious.

    // Best: Modify `tests/e2e/fixtures/base.fixture.cjs` if it exists and use it everywhere.
    // Currently specs import `test` from `@playwright/test`.
    // If I create `tests/e2e/fixtures.ts` and export `test` extended with `initScript`.

    // Even easier: Just put it in `tests/e2e/global-setup.cjs`? No, that runs in node.

    // I can put it in `playwright.config.cjs` if I use `metadata`? No.

    // I will verify if `tests/e2e/utils/auth.fixture.cjs` is used globally? No.

    // I'll search for where `test` object is imported.
    // `const { test, expect } = require('@playwright/test');`

    // Ok, I'll modify `tests/e2e/global-setup.cjs` to NOT inject script, but...
    // Playwright config `projects` allows `use`.
    // Is there a way to inject script via config?
    // `launchOptions.args`?

    // Plan B: Update `OutputRouter.ts` to check `navigator.userAgent` for "Playwright"?
    // Playwright sets headless chrome UA.
    // Often it contains "HeadlessChrome".
    // I can verify if `navigator.webdriver` is true.
    // `OutputRouter.ts`: `if (navigator.webdriver) return;`
    // This disables DB logging for ANY automation.
    // This is probably acceptable for this repo's "System Logs".
    // Real users don't have webdriver true.
    // Let's try `navigator.webdriver`.

    /* NO REPLACEMENT in config file needed then. */

    // ===========================================
    // Project Definitions
    // ===========================================
    projects: [
        {
            name: 'setup',
            testMatch: /global-setup\.cjs/,
            teardown: 'teardown',
        },
        {
            name: 'teardown',
            testMatch: /global-teardown\.cjs/,
        },
        {
            name: 'desktop-chrome',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'desktop-chrome-hd',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'desktop-firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 },
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'desktop-webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 },
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'tablet-ipad',
            use: {
                ...devices['iPad Pro'],
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'tablet-ipad-landscape',
            use: {
                ...devices['iPad Pro landscape'],
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'mobile-iphone',
            use: {
                ...devices['iPhone 14'],
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'mobile-iphone-landscape',
            use: {
                ...devices['iPhone 14 landscape'],
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'mobile-android',
            use: {
                ...devices['Pixel 7'],
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'admin',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                storageState: 'tests/e2e/playwright/.auth/admin.json',
            },
            testMatch: '**/admin/**/*.spec.ts',
            dependencies: ['setup'],
        },
        {
            name: 'smoke',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                storageState: 'tests/e2e/playwright/.auth/user.json',
            },
            grep: /@smoke/,
            dependencies: ['setup'],
        },
    ],

    // ===========================================
    // Web Server Configuration
    // ===========================================
    // ===========================================
    // Web Server Configuration
    // ===========================================
    webServer: (process.env.CI || process.env.DOCKER_MODE) ? undefined : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },

    // ===========================================
    // Output Directories
    // ===========================================
    outputDir: 'test-results',
});
