# Coding Guidelines

This document details the coding standards, style guides, and linting rules enforced in the codebase.

## Linting & Formatting

The project uses **ESLint** (Flat Config) combined with **Prettier** for code quality and formatting.

### Key Rules
- **Quotes**: Single quotes (`'`) are preferred.
- **Semicolons**: Always used (Prettier default).
- **Ordering**: Imports and object keys are sorted automatically using `eslint-plugin-perfectionist`.
- **No Shadowing**: Variables cannot shadow outer scope variables (`@typescript-eslint/no-shadow`).
- **No Underscore Dangle**: `_private` variables are generally discouraged, except for unused function arguments (prefixed with `_`).

### Running Linter
```bash
npm run lint
```

## Naming Conventions

### Files & Directories
- **Components (.tsx)**: PascalCase (e.g., `UserProfile.tsx`, `Button.tsx`).
- **Hooks**: camelCase, prefixed with 'use' (e.g., `useAuth.ts`).
- **Utilities/Functions (.ts)**: camelCase (e.g., `formatDate.ts`).
- **Redux Slices**: camelCase, suffixed with Slice (e.g., `userSlice.ts`).

### Code Symbols
- **Classes/Interfaces/Types**: PascalCase (e.g., `User`, `AuthResponse`).
- **Variables/Functions**: camelCase (e.g., `isLoading`, `fetchData`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`).
- **React Components**: PascalCase (e.g., `function MyComponent() { ... }`).

## TypeScript Usage

- **Strict Mode**: Enabled. `any` should be avoided. Use `unknown` if the type is truly not known, or generic `<T>`.
- **Interfaces vs Types**: Use `interface` for object definitions that might be extended. Use `type` for unions and primitives.
- **Explicit Returns**: Prefer explicit return types for complex functions to ensure contract safety.

## Imports

- **Absolute Paths**: Always use absolute imports configured in `tsconfig.json` (e.g., `@/components/Button`) instead of relative paths (`../../components/Button`).
- **Restricted Imports**: Do not import from `src/store/actions` directly in components; import from the Slice or use specific hooks.
