# AI Agent Debugging Protocols for WebOS v2

## 1. Introduction
This guide defines standard protocols for AI agents (Claude, Gemini, ChatGPT, etc.) to investigate, debug, and resolve issues within the WebOS v2 codebase. It leverages specific tooling (`npm run test:ai`, `LogService`) designed to provide deterministic and parseable output.

## 2. General Principles
*   **Determinism**: Always prefer tools that output strictly deterministic results. Avoid parallel execution during debugging unless specifically testing concurrency.
*   **Verbosity**: Prefer verbose, structured output over human-readable summaries when analyzing failures.
*   **Isolation**: Attempt to isolate faults to specific files or modules before running broad test suites.

## 3. The Debugging Workflow

### Step 1: Isolation & Reproduction
Before fixing a bug, confirm it exists and isolate the scope.

*   **Command**: `npm run test:ai -- <path/to/test/file>`
    *   *Why*: This runs the specific test file in-band (sequentially) using the `AIReporter`.
    *   *Output*: Look for `<TEST_FILE_FAILURE>` and `<FAILURE_MESSAGE>` tags.

### Step 2: Log Analysis
The application now uses a structured `LogService`.

*   **Test Environment**:
    *   Logs are output in a flat format: `LEVEL [Source] Message`.
    *   Look for `ERROR` or `WARN` level logs preceding a failure.
    *   *Note*: `console.log` is often suppressed or strictly routed. Do not rely on ad-hoc `console.log` unless you inserted it yourself for temporary debugging.

*   **Production/Dev Environment**:
    *   Logs are structured JSON.
    *   Use `jq` or similar if parsing file-based logs (though mostly agents will read stdout/stderr).

### Step 3: Fixing Phase (Code Modification)
*   **Type Safety**: Always fix the root cause of type errors. Do not use `@ts-ignore` or `any` unless absolutely necessary and documented.
*   **Linting**: Run `npm run lint` on the modified file to ensure no regressions.
*   **Database Constraints**: If a DB error occurs (e.g., `SQLITE_CONSTRAINT`), check `src/lib/schemas` and `src/db/entities` for mismatches.

### Step 4: Verification
*   **Unit/Integration**: Run `npm run test:ai -- <path/to/fixed/file>` again.
*   **Full Build**: Run `npm run verify` to ensure no regressions elsewhere.

## 4. Key Tools

### `npm run test:ai`
*   **Flags**: `--runInBand`, `--reporters=<rootDir>/scripts/ai-reporter.js`
*   **Usage**: Primary tool for AI debugging.
*   **Output Format**:
    ```xml
    <TEST_FILE_FAILURE path="...">
      <FAILED_TEST name="...">
        <FAILURE_MESSAGE><![CDATA[ ... ]]></FAILURE_MESSAGE>
      </FAILED_TEST>
    </TEST_FILE_FAILURE>
    ```

### `npm run typecheck`
*   **Command**: `tsc --noEmit -p tsconfig.prod.json`
*   **Usage**: Run this *first* when encountering build errors or unexplained behaviors.
*   **Why**: TypeScript errors often mask underlying logic issues.
*   **Output**: Standard TypeScript compiler output. Look for `error TSxxxx`.

### `npm run lint`
*   **Command**: `eslint src --fix --format ./scripts/lintFormatter.mjs`
*   **Usage**: Run after making changes to ensure code quality.
*   **formatter**: The custom `lintFormatter.mjs` provides output that is less cluttered than standard ESLint output, focusing on file paths and error messages.
*   **Note**: This command automatically attempts to fix fixable errors (`--fix`).

### `npm test` (Standard)
*   **Usage**: Use only when you need to run the full suite coverage or when `test:ai` output is insufficient for some edge case.
*   **Note**: Less deterministic than `test:ai` due to parallel execution.

### `LogService`
*   **Location**: `src/services/logging/LogService.ts`
*   **Usage**:
    ```typescript
    import { LogService } from '@/services/logging/LogService';
    // ...
    LogService.getInstance().info('Message', { metadata });
    ```
*   **Don't**: Use `console.log` in `src/`.

## 5. Common Failure Patterns

### A. "Database not ready" / Deadlocks
*   **Symptom**: Tests hanging or persistent timeout errors.
*   **Cause**: `OutputRouter` trying to log to DB while DB is initializing.
*   **Fix**: Ensure `!db?.isReady` check is present in `OutputRouter.ts`.

### B. "Window is not defined"
*   **Symptom**: `ReferenceError: window is not defined`
*   **Cause**: Code running in Node environment (server test) accessing DOM globals.
*   **Fix**:
    *   Ensure file has `/** @jest-environment jsdom */` if it tests UI components.
    *   Mock `window` or `localStorage` if testing shared logic in a Node environment.

### C. Zod Validation Errors
*   **Symptom**: `ZodError: ...`
*   **Cause**: Mismatch between DB schema and Zod schema.
*   **Fix**: Check `src/lib/schemas`. Note that UUID validation is "relaxed" for legacy string IDs (e.g., in Workflow schemas).

## 6. Escalation
If a failure cannot be resolved after 3 attempts or requires architectural decisions:
1.  Document findings in `walkthrough.md`.
2.  Notify the USER with specific "Blocked" status.
