# Playwright E2E Testing Setup

This document outlines the setup and usage of the Playwright end-to-end testing framework for WebOS v2.

## 1. Overview
We use [Playwright](https://playwright.dev/) for automated end-to-end testing. The tests are located in `tests/e2e`.

## 2. Directory Structure
```
tests/e2e/
├── config/         # Configuration and environment helpers
├── fixtures/       # Test fixtures (customized test environment)
├── pages/          # Page Object Models
├── specs/          # Test specifications (feature-grouped)
├── utils/          # Shared utilities
├── global-setup.cjs     # Global setup (Auth state)
└── global-teardown.cjs  # Global teardown
```

## 3. Configuration
The main configuration is in `playwright.config.cjs`.
- **Base URL**: Defaults to `http://127.0.0.1:4000` (configurable via `BASE_URL`).
- **Auth**: Global setup handles authentication and saves state to `playwright/.auth/`.
- **Mode**: Runs in HEADED mode by default (configurable via `HEADED=false`).

## 4. Running Tests

### Standard Run (All Tests)
```bash
npx playwright test
```

### Run specific project (e.g., Desktop Chrome)
```bash
npx playwright test --project="Desktop Chrome"
```

### Run in Debug Mode
```bash
npm run test:e2e:debug
```

### Run UI Mode
```bash
npm run test:e2e:ui
```

### Troubleshooting
- If tests fail with "Connection Refused", ensure the local dev server is running or let Playwright start it (default logic).
- On CI/Headless environments, set `HEADED=false`.

## 5. Writing Tests
- Use Page Objects from `tests/e2e/pages`.
- Use the `test` fixture from `tests/e2e/fixtures/base.fixture.ts`.
- Add new tests in `tests/e2e/specs`.

## 6. Best Practices & Strict Mode
WebOS v2 enforces specific patterns to ensure test stability and AI-agent compatibility:

### 1. Robust Waiting
**❌ Avoid:** `await page.waitForTimeout(1000)`  
**✅ Use:** `await page.getByTestId('component-id').waitFor({ state: 'visible' })`  
Always wait for specific UI states (visibility, attachment) rather than arbitrary time.

### 2. Scoped Selectors
**❌ Avoid:** Global lookups like `page.getByText('Save')` which may match multiple elements.  
**✅ Use:** `container.getByRole('button', { name: 'Save' })`  
Scope searches to the relevant container (modal, card, list item) to prevent Strict Mode violations.

### 3. User-Facing Attributes
Prioritize selectors in this order:
1. `getByRole(role, { name })` - Best for accessibility and robustness.
2. `getByLabel(label)` - Great for forms.
3. `getByTestId(id)` - Use for structural containers without semantic roles.
4. `getByText(text)` - Use sparingly and always scoped.

## 7. CI/CD
A GitHub Actions workflow is available in `.github/workflows/playwright.yml`.
