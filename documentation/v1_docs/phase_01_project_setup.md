# Phase 1: Project Initialization & Monorepo Structure

## Objective
Initialize the project structure as a monorepo, configure the build system, and establish code quality standards. This phase sets the foundation for all subsequent development.

## Dependencies
- None

## Tasks
1.  **Initialize Monorepo Structure**
    - Ensure root `package.json` defines workspaces: `packages/*`, `services/*`, `apps/*`.
    - Create directory structure:
        - `services/auth`
        - `services/core` (shared logic)
        - `apps/web` (main frontend)
        - `packages/config` (shared configs)
        - `packages/types` (shared types)

2.  **Configure TypeScript**
    - Create `tsconfig.base.json` in root.
    - Create specific `tsconfig.json` for each workspace extending the base.
    - Ensure `strict: true` and `noImplicitAny: true`.

3.  **Setup ESLint & Prettier**
    - Configure root `.eslintrc.js` and `.prettierrc`.
    - Install necessary plugins: `typescript-eslint`, `eslint-plugin-react`, etc.
    - Ensure linting rules match the project's `STANDARDS.md` (no any, strict typing).

4.  **Setup Build System (Vite)**
    - Configure Vite for `apps/web`.
    - Configure build scripts in root `package.json` to trigger workspace builds.

5.  **Setup Testing Framework (Jest)**
    - Install Jest and `ts-jest`.
    - Create `jest.config.js` in root and per workspace.
    - Verify a simple "Hello World" test passes.

## Technical Considerations
- **Reference**: `package.json` (Tech Stack).
- **Standards**: Adhere to `GEMINI.md` for naming conventions.
- **Tools**: npm workspaces, Vite, TSC.

## Verification
- Run `npm install` successfully.
- Run `npm run lint` with no errors.
- Run `npm run build` and ensure all workspaces compile.
- Run `npm test` and pass the smoke test.
