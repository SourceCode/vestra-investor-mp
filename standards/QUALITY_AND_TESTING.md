# Quality Assurance & Testing

This document details the testing strategies and quality gates for WebOS v3.

## Testing Layers

### 1. Static Analysis
- **Tools**: TypeScript, ESLint, Prettier.
- **Goal**: Catch type errors, syntax errors, and style violations before code is run.
- **Command**: `npm run lint && npm run typecheck`

### 2. Unit & Integration Tests (Client)
- **Runner**: Jest
- **Environment**: `jsdom` (configured in `jest.config.mjs`).
- **Libraries**: React Testing Library (@testing-library/react).
- **Goal**: Verify component rendering, hook logic, and utility functions.
- **Command**: `npm run test`

#### Mocking Strategy
The test environment (`jest.setup.client.ts`) makes extensive use of global mocks to simulate the "WebOS" environment:
- **Redux**: `useAppSelector` and `useAppDispatch` are mocked.
- **Auth**: `useAuth` is mocked to provide a logged-in state by default.
- **DOM**: Window/Document properties (scroll, layout) are patched to support MUI components in JSDOM.
- **DOM**: Window/Document properties (scroll, layout) are patched to support MUI components in JSDOM.

### 3. End-to-End (E2E) Tests
- **Runner**: Playwright
- **Goal**: Verify full user flows, browser compatibility, and critical paths.
- **Command**: `npm run test:e2e`

## Quality Gates

### Pre-Commit Hooks (Husky)
Husky is configured to run linting and/or basic checks on commit. Ensure your code passes `npm run lint` before committing.

### CI Validation
The `npm run verify` script is the standard gatekeeper. It runs:
1.  Tests (`npm run test`)
2.  Linting (`npm run lint`)
3.  Type Checking (`npm run typecheck`)

All PRs must pass this command.
