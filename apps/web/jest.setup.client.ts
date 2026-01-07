/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import React from 'react';
import '@testing-library/jest-dom';
// Needs to include this to load fetch typings in client tests
// Required by @aws-amplify/adapter-nextjs
import 'whatwg-fetch';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock AppDataSource to prevent browser errors in client tests
jest.mock('@/db/data-source', () => ({
    AppDataSource: {
        isInitialized: false,
        getRepository: jest.fn(() => ({
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            findOneBy: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
            create: jest.fn().mockImplementation((entity) => entity),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            createQueryBuilder: jest.fn(() => ({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orWhere: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                innerJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
                getOne: jest.fn().mockResolvedValue(null),
                getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
        })),
        manager: {
            transaction: jest.fn((cb) => cb({
                save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                getRepository: jest.fn(() => ({
                    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
                    find: jest.fn().mockResolvedValue([]),
                })),
            })),
        },
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

// Mock repository factory functions to prevent AppDataSource usage in browser
// Jest mocks are hoisted so we need inline factory functions
const createMockRepositoryFactories = () => ({
    getContactRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getDealRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getAgentRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getGroupRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getPayrollRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getLeadRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getTaskRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getPropertyRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getClosingRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getEventRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getOfferRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getReportRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getSystemEventRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getTaskTemplateRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    getDealStageHistoryRepository: jest.fn(() => ({ find: jest.fn().mockResolvedValue([]), save: jest.fn(), findOne: jest.fn().mockResolvedValue(null) })),
    ContactRepository: jest.fn(),
    DealRepository: jest.fn(),
    AgentRepository: jest.fn(),
    LeadRepository: jest.fn(),
    TaskRepository: jest.fn(),
    ClosingRepository: jest.fn(),
    PropertyRepository: jest.fn(),
    PayrollRepository: jest.fn(),
    RepositoryFactory: jest.fn(),
});
// Mocks removed as directory does not exist

// Mock services that use AppDataSource directly
// Mocks removed for non-existent services

jest.mock('@/services/deal/deal.service', () => ({
    DealService: {
        getInstance: jest.fn(() => ({
            getAll: jest.fn().mockResolvedValue([]),
            getById: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue(undefined),
            getDealsByAgent: jest.fn().mockResolvedValue([]),
            getDealsByStage: jest.fn().mockResolvedValue([]),
            updateDealStage: jest.fn().mockResolvedValue({}),
            assignAgent: jest.fn().mockResolvedValue(undefined),
            removeAgent: jest.fn().mockResolvedValue(undefined),
        })),
    },
    dealService: {
        getAll: jest.fn().mockResolvedValue([]),
        getById: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue(undefined),
        getDealsByAgent: jest.fn().mockResolvedValue([]),
        getDealsByStage: jest.fn().mockResolvedValue([]),
        updateDealStage: jest.fn().mockResolvedValue({}),
        assignAgent: jest.fn().mockResolvedValue(undefined),
        removeAgent: jest.fn().mockResolvedValue(undefined),
    },
}));

// ContactService mock removed as file not found

// Mock tRPC client to prevent "Unable to find tRPC Context" errors
jest.mock('@/utils/trpc', () => {
    const createMockQuery = () => ({
        useQuery: jest.fn(() => ({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn(),
            isFetching: false,
            isSuccess: true,
        })),
        useSuspenseQuery: jest.fn(() => ({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        })),
        useMutation: jest.fn(() => ({
            mutate: jest.fn(),
            mutateAsync: jest.fn().mockResolvedValue({}),
            isLoading: false,
            isPending: false,
            isError: false,
            error: null,
            isSuccess: false,
            data: undefined,
            reset: jest.fn(),
        })),
        useInfiniteQuery: jest.fn(() => ({
            data: { pages: [], pageParams: [] },
            isLoading: false,
            isError: false,
            error: null,
            fetchNextPage: jest.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
        })),
    });

    // Create a mock utils object for useUtils
    const createMockUtils = () => {
        const utilsProxy: Record<string, unknown> = {};
        return new Proxy(utilsProxy, {
            get: () => {
                return new Proxy({}, {
                    get: (_t, p) => {
                        if (p === 'invalidate') return jest.fn().mockResolvedValue(undefined);
                        if (p === 'refetch') return jest.fn().mockResolvedValue(undefined);
                        if (p === 'setData') return jest.fn();
                        if (p === 'getData') return jest.fn().mockReturnValue(undefined);
                        return new Proxy({}, { get: () => jest.fn().mockResolvedValue(undefined) });
                    }
                });
            }
        });
    };

    const mockRouter: Record<string, unknown> = {};
    const routerProxy = new Proxy(mockRouter, {
        get: (_target, prop) => {
            if (prop === 'useContext' || prop === 'createClient') {
                return jest.fn();
            }
            if (prop === 'Provider') {
                return ({ children }: any) => children;
            }
            if (prop === 'useUtils') {
                return () => createMockUtils();
            }
            // Return a proxy for nested procedures (e.g., trpc.contacts.getAll)
            return new Proxy({}, {
                get: (_t, p) => {
                    const mockQuery = createMockQuery();
                    if (typeof p === 'string' && p in mockQuery) {
                        return (mockQuery as Record<string, unknown>)[p];
                    }
                    // For deeper nesting
                    return createMockQuery();
                }
            });
        }
    });

    return { trpc: routerProxy };
});

// Removed @/lib/trpc/provider mock

// Removed @/utils/api mock which does not exist
// End of removed API mock

// Mock React hooks and cache for client-side tests
// This provides mockable hooks that individual tests can override
const mockState = {
    agents: { items: [], loading: false, searchQuery: '', error: null },
    deals: { items: [], loading: false, error: null, viewMode: 'list' },
    contacts: { items: [], loading: false, error: null },
    leads: { items: [], loading: false, error: null },
    payroll: { items: [], loading: false, error: null },
    files: { items: [], loading: false, error: null, currentPath: '/', history: { stack: [], currentIndex: 0 }, selectedIds: [], viewMode: 'grid' },
    tasks: { items: [], loading: false, error: null },
    calendar: { events: [], loading: false, error: null },
    communication: { threads: [], loading: false, error: null },
    checkRequests: { items: [], loading: false, error: null },
    fundingRequests: { items: [], loading: false, error: null },
    salesContracts: { items: [], loading: false, error: null },
    documentation: {
        currentPage: { slug: 'intro', frontmatter: { title: 'Intro', section: 'Guide' }, content: '# Hello' },
        loading: false,
        navTree: [{ slug: 'intro', title: 'Intro', children: [] }],
        pages: [{ slug: 'intro', frontmatter: { title: 'Intro' }, content: '' }],
        searchQuery: ''
    },
    notifications: { items: [] },
    mobile: { isMobile: false },
    desktop: { isMobile: false },
    ui: { sidebarOpen: true, toasts: [] },
    window: { windows: [] },
    theme: { currentThemeId: 'default' },
    user: { currentUser: { id: 'test-user', roles: ['admin'] } }
};

jest.mock('@/store/index', () => ({
    useAppDispatch: () => jest.fn(),
    useAppSelector: jest.fn((selector) => selector(mockState)),
}));

// Removed obsolete @/hooks/useAuth mock

jest.mock('react', () => {
    const actualReact = jest.requireActual('react');
    return {
        ...actualReact,
        cache: jest.fn((fn) => fn),
        // Create proper Jest mock functions that tests can use mockReturnValue on
        useState: jest.fn().mockImplementation(actualReact.useState),
        useEffect: jest.fn().mockImplementation(actualReact.useEffect),
        useCallback: jest.fn().mockImplementation(actualReact.useCallback),
        useMemo: jest.fn().mockImplementation(actualReact.useMemo),
        useRef: jest.fn().mockImplementation(actualReact.useRef),
        useContext: jest.fn().mockImplementation(actualReact.useContext),
        useReducer: jest.fn().mockImplementation(actualReact.useReducer),
        useLayoutEffect: jest.fn().mockImplementation(actualReact.useLayoutEffect),
    };
});

import requiredEnvVars from './requiredEnvVars.json';

// Polyfill structuredClone for AWS Amplify compatibility in client tests
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj: any) => {
        // Simple JSON-based implementation for test environment
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch {
            // Fallback for complex objects
            return obj;
        }
    };
}



// Mock PerformanceObserver for browser-specific APIs
global.PerformanceObserver = Object.assign(
    jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
        takeRecords: jest.fn(),
    })),
    {
        supportedEntryTypes: [] as readonly string[],
    },
) as unknown as typeof PerformanceObserver;

// Mock other performance APIs that might not be available in Jest
global.performance = {
    ...global.performance,
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    now: jest.fn(() => Date.now()),
};


// Completely silence all console output during tests
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    trace: console.trace,
    dir: console.dir,
    dirxml: console.dirxml,
    group: console.group,
    groupCollapsed: console.groupCollapsed,
    groupEnd: console.groupEnd,
    time: console.time,
    timeLog: console.timeLog,
    timeEnd: console.timeEnd,
    count: console.count,
    countReset: console.countReset,
    clear: console.clear,
    table: console.table,
    assert: console.assert,
    profile: console.profile,
    profileEnd: console.profileEnd,
    timeStamp: console.timeStamp,
};

beforeAll(() => {




    // Mock all console methods to do nothing
    Object.keys(originalConsole).forEach((key) => {
        (console as any)[key] = jest.fn();
    });

    // next/router is already mocked at module level above (REMOVED)

    requiredEnvVars.requiredEnvVars.forEach((key) => {
        process.env[key] = process.env[key] || `mocked-${key}`;
    });

    // Enhanced DOM elements mocking for MUI transitions
    Object.defineProperty(window, 'scrollTo', {
        value: jest.fn(),
        writable: true,
    });
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
        value: jest.fn(),
        writable: true,
    });
    Object.defineProperty(Element.prototype, 'scrollTop', {
        value: 0,
        writable: true,
    });
    Object.defineProperty(Element.prototype, 'scrollHeight', {
        value: 100,
        writable: true,
    });
    Object.defineProperty(Element.prototype, 'clientHeight', {
        value: 100,
        writable: true,
    });

    // Ensure document.body.style exists for MUI Modal components
    if (document.body) {
        // Add properties that MUI Modal expects
        Object.defineProperty(document.body.style, 'overflowY', {
            value: '',
            writable: true,
        });
        Object.defineProperty(document.body.style, 'paddingRight', {
            value: '',
            writable: true,
        });
    }

    // Fix getComputedStyle for toHaveStyle testing
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = jest.fn().mockImplementation((element) => {
        const result = originalGetComputedStyle
            ? originalGetComputedStyle(element)
            : ({} as CSSStyleDeclaration);

        // Create a mock CSSStyleDeclaration with getPropertyValue
        return {
            ...result,
            getPropertyValue: jest.fn((prop: string) => {
                // Convert camelCase to kebab-case
                const kebabProp = prop.replace(
                    /[A-Z]/g,
                    (match: string) => `-${match.toLowerCase()}`,
                );
                return (
                    (result as unknown as Record<string, string>)[prop] ||
                    (result as unknown as Record<string, string>)[kebabProp] ||
                    ''
                );
            }),
            // Add common style properties
            cursor: (result as unknown as Record<string, string>).cursor || '',
            margin: (result as unknown as Record<string, string>).margin || '',
            minWidth: (result as unknown as Record<string, string>).minWidth || '',
            bottom: (result as unknown as Record<string, string>).bottom || '',
            right: (result as unknown as Record<string, string>).right || '',
        };
    });
    Object.defineProperty(Element.prototype, 'offsetHeight', {
        value: 100,
        writable: true,
    });
    Object.defineProperty(Element.prototype, 'offsetWidth', {
        value: 100,
        writable: true,
    });
    Object.defineProperty(Element.prototype, 'scrollWidth', {
        value: 100,
        writable: true,
    });
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        value: jest.fn(() => ({
            top: 0,
            left: 0,
            bottom: 100,
            right: 100,
            width: 100,
            height: 100,
        })),
        writable: true,
    });

    // Mock document and window methods that MUI transitions use
    Object.defineProperty(document, 'documentElement', {
        value: {
            scrollTop: 0,
            scrollHeight: 100,
            clientHeight: 100,
            style: {},
        },
        writable: true,
    });

    // Define missing global variables that components expect
    (global as unknown as Record<string, unknown>).theme = {
        palette: {
            primary: { main: '#1976d2', dark: '#115293' },
            secondary: { main: '#dc004e', dark: '#9a0036' },
            grey: { 200: '#eeeeee', 500: '#9e9e9e' },
        },
        spacing: (factor: number) => `${factor * 8}px`,
        typography: { htmlFontSize: 16 },
        breakpoints: {
            up: jest.fn(),
            down: jest.fn(),
            only: jest.fn(),
        },
    };





    // Mock other common global variables
    (global as unknown as Record<string, unknown>).gtag = jest.fn();
    (global as unknown as Record<string, unknown>).fbq = jest.fn();
    (global as unknown as Record<string, unknown>).analytics = {
        track: jest.fn(),
        identify: jest.fn(),
        page: jest.fn(),
        reset: jest.fn(),
    };

    // Enhanced document methods mocking for MUI compatibility
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
        const mockElement = document.createElement('div');
        mockElement.id = id;
        // Add all properties that MUI transitions might access
        Object.defineProperty(mockElement, 'scrollTop', {
            value: 0,
            writable: true,
        });
        Object.defineProperty(mockElement, 'scrollHeight', {
            value: 100,
            writable: true,
        });
        Object.defineProperty(mockElement, 'clientHeight', {
            value: 100,
            writable: true,
        });
        Object.defineProperty(mockElement, 'offsetHeight', {
            value: 100,
            writable: true,
        });
        Object.defineProperty(mockElement, 'offsetWidth', {
            value: 100,
            writable: true,
        });
        Object.defineProperty(mockElement, 'scrollWidth', {
            value: 100,
            writable: true,
        });
        Object.defineProperty(mockElement, 'getBoundingClientRect', {
            value: () => ({
                top: 0,
                left: 0,
                bottom: 100,
                right: 100,
                width: 100,
                height: 100,
            }),
            writable: true,
        });
        return mockElement;
    });

    // Mock querySelector and querySelectorAll to return elements with scrollTop
    jest.spyOn(document, 'querySelector').mockImplementation(() => {
        const mockElement = document.createElement('div');
        Object.defineProperty(mockElement, 'scrollTop', {
            value: 0,
            writable: true,
        });
        Object.defineProperty(mockElement, 'clientHeight', {
            value: 100,
            writable: true,
        });
        Object.defineProperty(mockElement, 'offsetHeight', {
            value: 100,
            writable: true,
        });
        return mockElement;
    });

    jest.spyOn(document, 'querySelectorAll').mockImplementation(() => {
        const mockElement = document.createElement('div');
        Object.defineProperty(mockElement, 'scrollTop', {
            value: 0,
            writable: true,
        });
        Object.defineProperty(mockElement, 'clientHeight', {
            value: 100,
            writable: true,
        });
        return [mockElement] as unknown as NodeListOf<Element>;
    });
});

// Note: Mocks for stateBridgeHooks and AuthStatusProvider should be added
// in individual test files or test utilities as needed, not globally

afterAll(() => {
    jest.restoreAllMocks();
    // Restore original console methods
    Object.keys(originalConsole).forEach((key) => {
        (console as any)[key] = (originalConsole as any)[key];
    });
});

export { React };
