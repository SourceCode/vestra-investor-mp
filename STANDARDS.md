# WebOS v3 Engineering Standards

This document serves as the central hub for all engineering standards, architectural patterns, and development guidelines for the WebOS v3 project.

## Project Overview

WebOS v3 is a complex React-based application designed to emulate a desktop operating system within the browser. It features a unique "local-first" database architecture, a window management system, and a modular app ecosystem.

## Documentation Index

Please refer to the following documents for detailed standards:

### 1. [Technology Stack](./standards/TECHNOLOGY_STACK.md)
Detailed breakdown of the core framework, packages, and libraries used (React 19, Vite, Redux, MUI, PostgreSQL).

### 2. [Architecture & Patterns](./standards/ARCHITECTURE_AND_PATTERNS.md)
Explanation of the OS metaphor (`src/os`, `src/apps`), state management (Redux Slices/Sagas), and directory structure.

### 3. [Coding Guidelines](./standards/CODING_GUIDELINES.md)
Rules for linting (ESLint/Prettier), file naming, directory organization, and TypeScript usage.

### 4. [Quality Assurance & Testing](./standards/QUALITY_AND_TESTING.md)
Guide to writing tests (Jest, Playwright), understanding the mock environment, and using CI tools.

## Quick Start

1.  **Install Dependencies**: `npm install`
2.  **Start Development Server**: `npm run dev`
3.  **Run Validation**: `npm run verify` (Runs Tests, Lint, and Typecheck)

## Core Principles

- **Strict Typing**: TypeScript strict mode is enabled. No explicit `any`.
- **Component Isolation**: Apps in `src/apps` should be self-contained.
- **Local-First Data**: leverage PostgreSQL (via Proxy) for robust data handling.
- **Consistent Style**: Rely on automated tooling (ESLint/Perfectionist) for code style.
