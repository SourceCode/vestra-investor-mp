# Technology Stack & Packages

This document outlines the core technology stack, key packages, and their intended usage within the WebOS v3 codebase.

## Core Framework & Build

| Technology | Version | Purpose | Implementation Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | >=20.0.0 | Runtime | Required for dev environment and build scripts. |
| **TypeScript** | ~5.8.2 | Language | Strict type checking enabled (`strict: true`). All new code must be typed. |
| **React** | ^19.2.1 | UI Framework | Functional components with Hooks. `strictMode` is likely enabled. |
| **Vite** | ^6.2.0 | Build Tool | Development server and production bundler. Configured in `vite.config.ts`. |
| **Yarn/NPM** | | Package Manager | `package-lock.json` suggests npm is the primary manager. |

## State Management

| Package | Purpose | Usage Guidelines |
| :--- | :--- | :--- |
| **Redux Toolkit** (`@reduxjs/toolkit`) | Global State | Use `createSlice` for state logic. Immer is built-in, allowing mutable-style state updates. |
| **Redux Saga** | Side Effects | Handles complex async flows, API calls, and process management. Prefer Sagas over Thunks for complex logic. |
| **React Redux** | React Bindings | Use `useAppSelector` and `useAppDispatch` hooks (typed wrappers). |
| **TanStack Query** | Data Fetching | Used for server state caching and fetching (likely for external APIs). |

## User Interface (UI)

| Package | Purpose | Usage Guidelines |
| :--- | :--- | :--- |
| **Material UI (MUI) v7** | Component Library | Primary UI kit. Use generic components where possible. |
| **Tailwind CSS v4** | Styling | Utility-first CSS. Used for layout, spacing, and custom overrides. Configured in `tailwind.config.js`. |
| **Framer Motion** | Animations | Use for complex layout transitions and gesture-based animations. |
| **Lucide React** | Icons | Standard icon set. Prefer over MUI Icons for consistency if established. |
| **Radix UI** | Primitives | Accessible headless UI primitives (Popover, Tooltip). |
| **CLSX / Tailwind Merge** | Class Utilities | Use `cn()` or manual combination for conditional class names. |

## Data & Storage (Frontend)

| Package | Purpose | Usage Guidelines |
| :--- | :--- | :--- |
| **PostgreSQL** | 15+ | Database | Primary relational database (accessed via Dev Server Proxy). |
| **TypeORM** | ORM | Manages database entities and queries against PostgreSQL. |
| **TypeORM-Zod** | Validation | Generates Zod schemas from TypeORM entities. |
| **Zod** | Schema Validation | Runtime validation for forms and API responses. |

## Forms

| Package | Purpose | Usage Guidelines |
| :--- | :--- | :--- |
| **React Hook Form** | Form State | efficient, uncontrolled form validation. |
| **@hookform/resolvers**| Validation Adapter | connects Zod schemas to React Hook Form. |

## Testing

| Package | Purpose | Usage Guidelines |
| :--- | :--- | :--- |
| **Jest** | Unit/Integration | Test runner for logic and components. Configured in `jest.config.mjs`. |
| **React Testing Library** | Component Testing | Tests UI from user perspective. |
| **Playwright** | E2E Testing | Full browser automation tests. |

## Utilities

| Package | Purpose |
| :--- | :--- |
| **date-fns** | Date manipulation. Functional and tree-shakeable. |
| **uuid** | ID generation. |
| **lodash/debounce** | Debouncing functions (e.g., search inputs). |

## Infrastructure & Cloud

| Package | Purpose |
| :--- | :--- |
| **AWS Amplify** | Auth, Storage, Backend integration. |
