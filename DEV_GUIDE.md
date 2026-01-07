# Developer Guide

## Architecture
*   **Frontend:** React 18, TypeScript, Vite/Webpack (assumed).
*   **State Management:** Redux Toolkit + Redux Saga.
*   **Routing:** React Router v6.
*   **Styling:** Material UI (MUI) v5 + Tailwind CSS.
*   **Maps:** Leaflet via `react-leaflet`.

## Directory Structure
*   `/src`
    *   `/components`: Reusable UI components.
        *   `/transaction`: Deal management specific components.
        *   `/org`: Organization settings components.
        *   `/analytics`: Charting components.
    *   `/pages`: Route handlers.
    *   `/store`: Redux setup, slices, and sagas.
    *   `/types`: TypeScript definitions.
    *   `/mocks`: Fake API layer (`api.ts`).
    *   `/hooks`: Custom hooks (`useAccessibility`, `useTenant`, etc).
    *   `/contexts`: React contexts (`Toast`, `FeatureFlag`).

## Key Patterns

### Data Fetching
We use Redux Sagas to handle side effects.
1.  Dispatch a `REQUEST` action (e.g., `fetchPropertiesRequest`).
2.  Saga intercepts, calls `mockApi`.
3.  Saga dispatches `SUCCESS` or `FAILURE` action.
4.  Reducer updates state.

### Lazy Loading
Route-based code splitting is implemented in `App.tsx`.
New pages should be imported using `React.lazy()`.

### Feature Flags
Use `useFeatureFlags()` hook to toggle functionality.
*   `if (!flags.newFeature) return null;`

## How to...

### Add a New Page
1.  Create `pages/MyNewPage.tsx`.
2.  Add route in `App.tsx` (wrapped in `Suspense` logic if lazy).
3.  Add link in sidebar/menu components (`AppShell` or `AgentShell`).

### Add a New Mock API
1.  Update `types.ts` with response interface.
2.  Add mock data array in `mocks/api.ts`.
3.  Add async function in `mockApi` object (simulate delay with `setTimeout`).

### Mocking Environment
The app runs in "Mock Mode" by default. All data persists in memory only during the session. Refreshing resets state (unless persisted to localStorage, which is currently limited).

## Deployment
Production build runs `npm run build`.
Ensure `NODE_ENV=production` for a11y audit log suppression.
