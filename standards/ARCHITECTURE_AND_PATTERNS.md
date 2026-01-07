# Architecture & Software Patterns

This document defines the architectural patterns and code organization for WebOS v3.

## Architectural Overview: The "Browser OS" Metaphor

WebOS v3 is structured to mimic an Operating System running within the browser.

### 1. The Kernel (src/os)
The `src/os` directory contains the core logic that manages the windowing environment, system tray, and process management.
- **WindowManager**: Manages the state, position, and z-index of application windows.
- **SystemTray**: Manages global indicators and quick actions.

### 2. The Applications (src/apps)
Individual applications (e.g., Contacts, Mail, Calendar) reside in `src/apps`.
- **Isolation**: Each app should ideally be self-contained with its own components and routes.
- **Integration**: Apps interact with the OS via hooks and the global Redux store.

### 3. The System Services (src/system)
Low-level services that abstract complexity from apps.
- likely includes filesystem mocks, notification dispatchers, etc.

### 4. The Data Layer (src/db)
WebOS v3 uses a unique "Local-First" database architecture.
- **Engine**: `sql.js` (SQLite in WebAssembly).
- **ORM**: TypeORM is used to define entities and run queries against the in-memory SQLite DB.
- **Persistence**: Database state is likely persisted to IndexedDB or LocalStorage (or syncs with AWS Amplify).

## State Management Patterns

### Redux Toolkit (State)
- **Slices**: State is divided into slices (e.g., `userSlice`, `windowSlice`).
- **Immer**: Direct mutation syntax is allowed and encouraged within reducers (e.g., `state.value = 1`).
- **Selectors**: Use typed `useAppSelector` with memoized selectors (reselect) for performance.

### Redux Saga (Side Effects)
- **Watcher/Worker Pattern**: Use sagas to listen for actions (e.g., `FETCH_USER_REQUEST`) and trigger side effects.
- **Complex Flows**: Use Sagas for multi-step processes (e.g., Authentication flow, Data synchronization).

## Directory Structure

```
src/
├── apps/           # Individual user-facing applications
├── components/     # Shared UI components (Generic, Atomic)
├── db/             # TypeORM Entities and Database connection logic
├── hooks/          # Shared custom React Hooks
├── lib/            # Core utilities, types, and interfaces
│   ├── classes/
│   ├── consts/
│   ├── enums/
│   ├── errors/
│   ├── interfaces/
│   ├── schemas/    # Zod schemas
│   └── utils/
├── os/             # Window Manager and Desktop environment logic
├── store/          # Redux Setup
│   ├── sagas/      # Global Sagas
│   └── slices/     # Redux Slices
├── system/         # Background services and system adapters
└── services/       # API services (External HTTP calls)
```

## Component Patterns

### Shared Components (@/components)
- **Presentational**: Should be largely stateless or UI-state only.
- **Props**: Use strict TypeScript interfaces for props.
- **Styling**: Use Tailwind utility classes.

### App Components (@/apps/*)
- **Container/View**: Connect to Redux store and pass data down.
- **Specific**: Components unique to an app stay within that app's folder.
