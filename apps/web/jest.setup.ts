import '@testing-library/jest-dom';

// Additional setup to run before tests to be implemented here.
// jest.setup.js or jest.setup.ts
// Critical: DataDog mocking must be at module level to prevent API calls
jest.mock('@datadog/browser-logs');
jest.mock('@datadog/browser-rum');

// Mock console.log
beforeAll(() => {

    jest.spyOn(console, 'log').mockImplementation(() => { }); // Silences console.log
    jest.spyOn(console, 'error').mockImplementation(() => { }); // Silences console.error
    jest.spyOn(console, 'warn').mockImplementation(() => { }); // Silences console.warn
    jest.spyOn(console, 'info').mockImplementation(() => { }); // Silences console.warn

    jest.spyOn(console, 'info').mockImplementation(() => { }); // Silences console.warn
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});

// Mock sql.js global to avoid WASM errors in unit tests
// Mock sql.js global to avoid WASM errors in unit tests
// sql.js mock removed (Full Postgres Migration)

import { AppDataSource } from '@/db/data-source';

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        // Suppress logs during init
        const originalLog = console.log;
        // console.log = jest.fn(); 
        try {
            await AppDataSource.initialize();
        } catch (error) {
            originalLog('Failed to initialize AppDataSource in jest.setup.ts', error);
        }
        // console.log = originalLog;
    }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});