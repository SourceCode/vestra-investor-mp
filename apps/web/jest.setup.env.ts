import {
    TextDecoder as NodeTextDecoder,
    TextEncoder as NodeTextEncoder,
} from 'node:util';
import requiredEnvVars from './requiredEnvVars.json';

// Polyfill TextEncoder and TextDecoder globally
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = NodeTextEncoder as typeof global.TextEncoder;
    global.TextDecoder = NodeTextDecoder as typeof global.TextDecoder;
}

// Polyfill structuredClone for Node.js versions < 17
if (typeof global.structuredClone === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.structuredClone = (obj: any) => {
        // Simple JSON-based implementation for test environment
        // This covers most test cases where AWS Amplify needs structuredClone
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

// Mock environment variables
requiredEnvVars.requiredEnvVars.forEach((key) => {
    process.env[key] = process.env[key] || `mocked-${key}`;
});