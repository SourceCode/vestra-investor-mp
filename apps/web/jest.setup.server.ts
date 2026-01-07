// Mock React.cache for server-side tests
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    cache: jest.fn((fn) => fn),
}));

// Mock server logger
// const mockLogger = {
//     debug: jest.fn(),
//     error: jest.fn(),
//     info: jest.fn(),
//     warn: jest.fn(),
// };

beforeAll(() => {

    jest.spyOn(console, 'log').mockImplementation(() => { }); // Silences console.log
    jest.spyOn(console, 'error').mockImplementation(() => { }); // Silences console.error
    jest.spyOn(console, 'warn').mockImplementation(() => { }); // Silences console.warn
    jest.spyOn(console, 'info').mockImplementation(() => { }); // Silences console.warn
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});