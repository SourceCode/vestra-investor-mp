# Claude Code Development Standards

**Project:** [Project Name]
**Last Updated:** [Date]
**Applies to:** All AI assistants, developers, and code reviewers

---

## Core Principles

This project follows **strict TypeScript standards** and **SOLID programming principles**. Code quality and type safety are non-negotiable requirements.

---

## Type Safety Requirements

### ❌ NO `any` Types - EVER

**Rule:** The use of `any` type is **strictly prohibited** in this codebase.

**Why:**
- `any` defeats the purpose of TypeScript
- `any` breaks type inference and IDE tooling
- `any` hides bugs that TypeScript is designed to catch
- Strong typing ensures reliability and maintainability

**Instead of `any`, use:**

```typescript
// ❌ WRONG - Never use any
function processData(data: any): string {
  return JSON.stringify(data);
}

// ✅ CORRECT - Use unknown with type guards
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data);
  }
  throw new Error('Invalid data structure');
}

// ✅ CORRECT - Use generics
function processData<T extends Record<string, unknown>>(data: T): string {
  return JSON.stringify(data);
}

// ✅ CORRECT - Use defined types with schema validation
import type { z } from 'zod';
function processData<T>(data: T, schema: z.ZodType<T>): string {
  const validated = schema.parse(data);
  return JSON.stringify(validated);
}
```

**Exceptions:**
- **NONE** - There are no valid exceptions for using `any` in this codebase
- If you think you need `any`, you're solving the problem incorrectly

---

## Definition of Done

Code is **NOT considered complete** until all of the following pass:

### 1. Type Checking Passes

```bash
npm run typecheck
```

**Requirements:**
- Zero TypeScript errors
- No `any` types (enforced by `noImplicitAny: true`)
- No unsafe type assertions without validation
- Proper generic constraints

**Common Issues:**
```typescript
// ❌ WRONG - Type assertion without validation
const result = response as ExpectedType;

// ✅ CORRECT - Validate before asserting
if (typeof response === 'object' && response !== null && 'key' in response) {
  const result = response as ExpectedType;
  // Now we can safely use it
}
```

### 2. Linting Passes

```bash
npm run lint
```

**Requirements:**
- Zero ESLint errors
- Zero ESLint warnings (warnings are treated as errors in CI)
- No unused variables or imports
- Consistent formatting

**Auto-fix when possible:**
```bash
npm run lint -- --fix
```

### 3. Tests Pass

```bash
npm run test        # Unit tests
npm run test:all    # Unit + Integration tests
```

**Requirements:**
- All tests passing
- Appropriate coverage thresholds met
- Tests cover edge cases
- No skipped tests without justification

### 4. Build Succeeds

```bash
npm run build
```

**Requirements:**
- Clean build with no errors
- No post-build workarounds needed
- Type definitions generated correctly (if applicable)

### 5. Data Fetching Standards

**Rule:** Use **React Query (TanStack Query)** for all server state.
- **Do NOT** use Redux for server data (e.g., fetching lists, entities).
- **Do NOT** use `useEffect` for data fetching.
- **Use Redux ONLY** for client-only global UI state (e.g., modal visibility, theme).

**Standard Pattern:**
```typescript
// src/hooks/queries/useEntity.ts
export const useEntity = (id: string) => {
    return useQuery({
        queryKey: entityKeys.detail(id),
        queryFn: () => entityService.getById(id)
    });
};
```

---

## SOLID Principles

This project strictly adheres to SOLID principles. Every class, function, and module should follow these guidelines.

### S - Single Responsibility Principle

**Rule:** Each class/function should have ONE reason to change.

```typescript
// ❌ WRONG - Multiple responsibilities
class DataService {
  connect() { /* ... */ }
  disconnect() { /* ... */ }
  save(key: string, value: string) { /* ... */ }
  load(key: string) { /* ... */ }
  serialize(data: object) { /* ... */ }
  deserialize(data: string) { /* ... */ }
  validateSchema(data: unknown) { /* ... */ }
  buildQuery() { /* ... */ }
}

// ✅ CORRECT - Separate responsibilities
class Serializer {
  serialize<T>(data: T, schema: z.ZodType<T>): string { /* ... */ }
}

class Deserializer {
  deserialize<T>(data: string, schema: z.ZodType<T>): T { /* ... */ }
}

class SchemaValidator {
  validate<T>(data: unknown, schema: z.ZodType<T>): T { /* ... */ }
}

class DataService {
  constructor(
    private readonly serializer: Serializer,
    private readonly deserializer: Deserializer,
    private readonly validator: SchemaValidator
  ) {}

  save<T>(key: string, data: T, schema: z.ZodType<T>): Promise<void> { /* ... */ }
  load<T>(key: string, schema: z.ZodType<T>): Promise<T | null> { /* ... */ }
}
```

### O - Open/Closed Principle

**Rule:** Open for extension, closed for modification.

```typescript
// ❌ WRONG - Must modify to add new types
function serialize(data: unknown, type: string): string {
  if (type === 'string') {
    return String(data);
  } else if (type === 'number') {
    return String(data);
  } else if (type === 'date') {
    return (data as Date).toISOString();
  }
  // Must modify this function for each new type
}

// ✅ CORRECT - Extend without modifying
interface TypeSerializer {
  serialize(value: unknown): string;
  deserialize(value: string): unknown;
}

class StringSerializer implements TypeSerializer {
  serialize(value: unknown): string {
    return String(value);
  }
  deserialize(value: string): unknown {
    return value;
  }
}

class DateSerializer implements TypeSerializer {
  serialize(value: unknown): string {
    return (value as Date).toISOString();
  }
  deserialize(value: string): unknown {
    return new Date(value);
  }
}

class TypeSerializerFactory {
  private serializers = new Map<string, TypeSerializer>();

  register(type: string, serializer: TypeSerializer): void {
    this.serializers.set(type, serializer);
  }

  getSerializer(type: string): TypeSerializer | undefined {
    return this.serializers.get(type);
  }
}
```

### L - Liskov Substitution Principle

**Rule:** Subtypes must be substitutable for their base types.

```typescript
// ❌ WRONG - Violates LSP
class BaseService {
  save<T>(key: string, data: T): Promise<void> { /* ... */ }
}

class StrictService extends BaseService {
  // Breaks contract by throwing for empty objects
  save<T>(key: string, data: T): Promise<void> {
    if (Object.keys(data as object).length === 0) {
      throw new Error('Cannot save empty object');
    }
    return super.save(key, data);
  }
}

// ✅ CORRECT - Maintains contract
class BaseService {
  async save<T>(key: string, data: T, schema: z.ZodType<T>): Promise<void> {
    const validated = this.validate(data, schema);
    if (!this.isValid(validated)) {
      await this.handleInvalid(key, validated);
      return;
    }
    await this.doSave(key, validated);
  }

  protected validate<T>(data: T, schema: z.ZodType<T>): T {
    return schema.parse(data);
  }

  protected isValid<T>(data: T): boolean {
    return data !== null && data !== undefined;
  }

  protected async handleInvalid<T>(key: string, data: T): Promise<void> {
    // Log warning or handle gracefully
  }

  protected async doSave<T>(key: string, data: T): Promise<void> {
    // Actual save logic
  }
}
```

### I - Interface Segregation Principle

**Rule:** Clients should not depend on interfaces they don't use.

```typescript
// ❌ WRONG - Fat interface
interface DataOperations {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  batchSave<T>(items: T[]): Promise<void>;
  batchDelete(keys: string[]): Promise<void>;
  search(query: string): Promise<string[]>;
  subscribe(channel: string): void;
}

// ✅ CORRECT - Segregated interfaces
interface BasicOperations {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}

interface BatchOperations {
  batchSave<T>(items: T[]): Promise<void>;
  batchDelete(keys: string[]): Promise<void>;
}

interface SearchOperations {
  search(query: string): Promise<string[]>;
}

interface PubSubOperations {
  subscribe(channel: string): void;
}

// Services implement only what they need
class SimpleService implements BasicOperations {
  // Only implements basic operations
}

class BatchService implements BasicOperations, BatchOperations {
  // Implements basic + batch operations
}
```

### D - Dependency Inversion Principle

**Rule:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

```typescript
// ❌ WRONG - Direct dependency on concrete implementation
class UserService {
  private database = new PostgresDatabase();
  private cache = new RedisCache();

  async getUser(id: string): Promise<User | null> {
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return cached;

    const user = await this.database.query('SELECT * FROM users WHERE id = $1', [id]);
    await this.cache.set(`user:${id}`, user);
    return user;
  }
}

// ✅ CORRECT - Depend on abstractions
interface DatabaseClient {
  query<T>(sql: string, params: unknown[]): Promise<T>;
}

interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
}

class UserService {
  constructor(
    private readonly database: DatabaseClient,
    private readonly cache: CacheClient
  ) {}

  async getUser(id: string): Promise<User | null> {
    const cached = await this.cache.get<User>(`user:${id}`);
    if (cached) return cached;

    const user = await this.database.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    if (user) {
      await this.cache.set(`user:${id}`, user);
    }
    return user;
  }
}
```

---

## Testing Requirements

### Test Organization

Tests are organized into two categories:

1. **Unit Tests** - Test individual functions/classes in isolation
2. **Integration Tests** - Test components working together

### Test Philosophy: Defensive Testing

Tests should **break bad code, not just validate good code**.

**Priority order for test coverage:**
1. **Error paths** - What happens when things go wrong?
2. **Edge cases** - Boundary conditions, empty inputs, null values
3. **Logic branches** - Every if/else, switch case, ternary
4. **Happy paths** - Normal operation (often already tested incidentally)

### Defensive Test Categories

#### Category 1: Input Validation

```typescript
describe('defensive: input validation', () => {
  it('should reject null input', async () => {
    await expect(service.process(null as unknown as ValidInput))
      .rejects.toThrow();
  });

  it('should reject undefined input', async () => {
    await expect(service.process(undefined as unknown as ValidInput))
      .rejects.toThrow();
  });

  it('should reject empty object', async () => {
    await expect(service.process({} as ValidInput))
      .rejects.toThrow();
  });

  it('should reject invalid schema', async () => {
    const invalidData = { wrongField: 'value' };
    await expect(service.process(invalidData as ValidInput))
      .rejects.toThrow();
  });
});
```

#### Category 2: Boundary Conditions

```typescript
describe('defensive: boundary conditions', () => {
  it('should handle empty array', async () => {
    const result = await service.processItems([]);
    expect(result).toEqual({ processed: 0, items: [] });
  });

  it('should handle single item', async () => {
    const result = await service.processItems([singleItem]);
    expect(result.processed).toBe(1);
  });

  it('should handle maximum batch size', async () => {
    const maxItems = Array(1000).fill(validItem);
    const result = await service.processItems(maxItems);
    expect(result.processed).toBe(1000);
  });

  it('should handle string at max length', () => {
    const maxString = 'a'.repeat(255);
    expect(() => validator.validateString(maxString)).not.toThrow();
  });

  it('should reject string exceeding max length', () => {
    const tooLong = 'a'.repeat(256);
    expect(() => validator.validateString(tooLong)).toThrow();
  });
});
```

#### Category 3: Error Handling

```typescript
describe('defensive: external service failures', () => {
  it('should handle connection failure', async () => {
    mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'));
    const data = { id: '123' };

    await expect(service.save('test', data))
      .rejects.toThrow('Connection failed');
  });

  it('should handle timeout', async () => {
    mockClient.execute.mockRejectedValueOnce(new Error('Timeout'));

    await expect(service.execute(command))
      .rejects.toThrow('Timeout');
  });

  it('should handle network error gracefully', async () => {
    mockClient.send.mockRejectedValueOnce(new Error('Network error'));

    const result = await service.sendWithRetry(data);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });
});
```

#### Category 4: Logic Path Coverage

```typescript
describe('logic paths: batch operations', () => {
  it('should process items in chunks', async () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: `item${i}`,
      data: { value: i }
    }));

    const result = await service.batchProcess(items, { chunkSize: 10 });

    expect(result.metadata.chunksProcessed).toBe(3); // 25 items / 10 chunk size
    expect(result.successful.size).toBe(25);
  });

  it('should handle partial failures in batch', async () => {
    const items = [validItem, invalidItem, validItem];

    const result = await service.batchProcess(items);

    expect(result.successful.size).toBe(2);
    expect(result.failed.size).toBe(1);
  });
});
```

### Test Coverage Requirements

After writing defensive tests and logic path tests, verify coverage:

```bash
# Run unit tests with coverage
npm run test -- --coverage

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

**If coverage is below threshold:**
1. Review uncovered lines - are they reachable?
2. Add defensive tests for those paths
3. Consider if dead code should be removed
4. Never disable coverage to pass - fix the tests instead

### What NOT to Do

```typescript
// ❌ WRONG - Only testing happy path
describe('save', () => {
  it('should save', async () => {
    await service.save('test', data);
    expect(true).toBe(true);
  });
});

// ❌ WRONG - Shallow defensive testing
describe('save', () => {
  it('should handle null', async () => {
    await expect(service.save('test', null as any))
      .rejects.toThrow();
  });
  // Missing: undefined, empty object, schema validation, service errors, etc.
});

// ❌ WRONG - Not checking actual behavior
it('should process batch', async () => {
  const result = await service.batchProcess(items);
  expect(result).toBeTruthy();
  // Missing: expect(result.successful.size).toBe(expectedCount);
});

// ✅ CORRECT - Testing behavior with specific values
it('should process batch with correct counts', async () => {
  const result = await service.batchProcess(items);
  expect(result.successful.size).toBe(items.length);
  expect(result.failed.size).toBe(0);
  expect(result.metadata.totalItems).toBe(items.length);
  expect(result.metadata.successCount).toBe(items.length);
});
```

---

## E2E Testing for AI Agents (Token-Optimized)

This project includes AI-optimized E2E testing tools that reduce token usage by up to 98%. **Always use these tools instead of running Playwright directly.**

### Quick Reference - Command Priority

| Situation | Command | Tokens | Output |
|-----------|---------|--------|--------|
| Quick status check | `npm run e2e:code` | ~5 | Binary code (0-3) |
| Status with categories | `npm run e2e:status` | ~50 | Compact status string |
| After fixing code | `npm run e2e:run` | ~200 | Run tests + cache results |
| Analyze failures | `npm run e2e:analyze` | ~300 | Categorized analysis |
| Get next action | `npm run e2e:next` | ~30 | Pre-computed action |

### Binary Status Codes

The `npm run e2e:code` command returns a single digit:

| Code | Meaning | Next Action |
|------|---------|-------------|
| `0` | PASS - All tests passing | Ready to commit |
| `1` | FAIL - Tests failing, no auto-fix | Run `npm run e2e:analyze` |
| `2` | FIXABLE - Auto-fix available | Run `npm run e2e:fix -- --apply` |
| `3` | BLOCKED - No data or error | Run `npm run e2e:run` |

### Semantic Category Codes

Error categories use 2-letter codes for compact output:

| Code | Category | Common Cause |
|------|----------|--------------|
| `BC` | browser_compat | TypeORM/Node.js in browser |
| `NF` | element_not_found | Missing DOM element |
| `TO` | timeout | Slow operation |
| `AE` | assertion | Test assertion failed |
| `NE` | network | Network/fetch error |
| `SE` | server_error | Backend 500 error |

### AI Agent Decision Tree

```
START
  │
  ▼
npm run e2e:code
  │
  ├─► 0 (PASS) ──► Done! Ready to commit
  │
  ├─► 3 (BLOCKED) ──► npm run e2e:run ──► Loop back
  │
  ├─► 2 (FIXABLE) ──► npm run e2e:fix -- --apply ──► npm run e2e:run ──► Loop back
  │
  └─► 1 (FAIL) ──► npm run e2e:analyze
                      │
                      ├─► BC errors ──► Fix TypeORM imports ──► Loop back
                      ├─► SE errors ──► Check server logs
                      ├─► NF errors ──► Review DOM snapshots
                      └─► Other ──► Manual investigation
```

### Token-Efficient Workflow

**DO use this pattern (low tokens):**
```bash
# Step 1: Quick check (~5 tokens)
npm run e2e:code
# Output: 2

# Step 2: Since code=2, auto-fix is available (~50 tokens)
npm run e2e:fix -- --apply

# Step 3: Re-run tests (~200 tokens)
npm run e2e:run

# Step 4: Quick check again (~5 tokens)
npm run e2e:code
# Output: 0 (done!)
```

**DON'T do this (wastes tokens):**
```bash
# ❌ WRONG - Running Playwright directly produces 40,000+ tokens
npx playwright test --reporter=list

# ❌ WRONG - Reading raw test output
cat test-results/*/error-context.md

# ❌ WRONG - Analyzing errors manually
# (Reading full stack traces, DOM snapshots, etc.)
```

### Command Details

#### `npm run e2e:code` - Binary Status (5 tokens)
Returns only a number 0-3. Use as first check in any E2E workflow.

```bash
npm run e2e:code
# Output: 0, 1, 2, or 3
```

#### `npm run e2e:status` - Compact Status (~50 tokens)
Returns formatted status with category breakdown.

```bash
npm run e2e:status
# Output: X:3/15|BC:2@AF|TO:1
# Meaning: 3 of 15 failed, 2 browser_compat (auto-fixable), 1 timeout
```

#### `npm run e2e:run` - Execute Tests (~200 tokens)
Runs Playwright and caches results for analysis. Always use instead of `npx playwright test`.

```bash
npm run e2e:run
# Runs tests, saves to .e2e-cache/last-run.json
```

#### `npm run e2e:analyze` - Deep Analysis (~300 tokens)
Analyzes cached results with pattern matching, deduplication, and root cause identification.

```bash
npm run e2e:analyze
# Output:
# 📊 Analysis Summary
# ══════════════════════════════════════════════════
#   Total: 15 | Pass: 12 | Fail: 3
#
# 📁 Errors by Category
# ──────────────────────────────────────────────────
#   BC browser_compat: 2 errors [FIX AVAILABLE] ⚠️
#      Root cause: Service uses TypeORM directly
#
# ⚡ Recommended Actions
# ──────────────────────────────────────────────────
#   🔧 [P1.0] Fix 2 browser compat errors
#      Run: npm run e2e:fix -- --pattern=browser_compat
```

#### `npm run e2e:next` - Pre-computed Action (~30 tokens)
Returns the next recommended action as executable command.

```bash
npm run e2e:next
# Output: {"bash":"npm run e2e:fix -- --apply","expect":"fewer_failures"}
```

#### `npm run e2e:fix` - Apply Fixes
Applies automated fixes for known patterns (browser_compat, timeouts).

```bash
npm run e2e:fix -- --pattern=browser_compat
npm run e2e:fix -- --apply  # Apply all available fixes
```

### Pattern Recognition

The tools automatically recognize 15+ error patterns:

| Pattern ID | Auto-Fix | Description |
|------------|----------|-------------|
| `browser-compat-typeorm` | ✅ | TypeORM used in browser |
| `browser-compat-require` | ✅ | Node.js require() in browser |
| `browser-compat-singleton` | ✅ | Eager singleton initialization |
| `selector-timeout` | ❌ | Element wait timeout |
| `element-not-found` | ❌ | DOM element missing |
| `network-connection-refused` | ❌ | Server not running |
| `server-error-500` | ❌ | Backend error |
| `react-error-boundary` | ❌ | Unhandled React error |

### Fixing Browser Compatibility Errors

Browser compatibility errors (`BC`) are the most common. They occur when server-side code runs in the browser.

**Root Cause:** Eager singleton pattern
```typescript
// ❌ WRONG - Instantiates at module load
export const userService = new UserService(AppDataSource.getRepository(User));
```

**Fix:** Lazy initialization pattern
```typescript
// ✅ CORRECT - Instantiates on first use
let _userService: UserService | null = null;
export function getUserService(): UserService {
  if (!_userService) {
    _userService = new UserService(AppDataSource.getRepository(User));
  }
  return _userService;
}
```

### Cache Location

All E2E results are cached in `.e2e-cache/`:
- `last-run.json` - Most recent test run
- `analysis.json` - Enhanced analysis with pattern matching
- `history/` - Historical runs for trend analysis

### Integration with Definition of Done

E2E tests are part of the Definition of Done:

```bash
# Full validation before commit
npm run typecheck && npm run lint && npm run test && npm run e2e:code
# e2e:code must return 0 (PASS)
```

---

## Documentation Requirements

### Every Module Must Have

1. **JSDoc comments** for:
   - All exported classes
   - All public methods
   - All exported functions
   - All exported types
   - Complex logic that isn't immediately obvious

2. **Inline comments** for:
   - Complex algorithms
   - Non-obvious business logic
   - Workarounds or special cases
   - Validation logic

### JSDoc Standards

```typescript
/**
 * Saves an object with optional TTL
 *
 * @param key - Storage key identifier
 * @param data - The object to save
 * @param schema - Zod schema for validation
 * @param options - Optional save options (TTL, etc.)
 * @returns Promise that resolves when save is complete
 * @throws {ZodError} If schema validation fails
 * @throws {Error} If storage operation fails
 *
 * @example
 * ```typescript
 * const schema = z.object({ id: z.string(), name: z.string() });
 * await service.save(
 *   'users:123',
 *   { id: '123', name: 'John' },
 *   schema,
 *   { ttl: 3600 }
 * );
 * ```
 */
async save<T>(
  key: string,
  data: T,
  schema: z.ZodType<T>,
  options?: SaveOptions
): Promise<void> {
  // Implementation
}
```

---

## Git Commit Standards

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

**Examples:**
```
feat(batch): add batch update operation support

Implement batchUpdate method for BatchService.
Supports partial updates and error handling strategies.

Closes #42
```

```
fix(serialization): preserve Date objects in nested structures

The previous implementation lost Date type information
when serializing nested objects. Updated to preserve
Date objects through the serialization pipeline.

Breaking change: Requires zod@^4.0.0
```

---

## Pre-commit Checklist

Before committing code, verify:

- [ ] No `any` types used
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (and `--fix` applied if needed)
- [ ] `npm run test` passes
- [ ] `npm run test:integration` passes (if integration tests affected)
- [ ] Coverage meets thresholds
- [ ] JSDoc added for exported members
- [ ] README updated if public API changed
- [ ] CHANGELOG updated with changes
- [ ] No console.log or debug code
- [ ] No commented-out code
- [ ] Git diff reviewed for unintended changes

---

## Common Pitfalls to Avoid

### 1. Using `any`
```typescript
// ❌ NEVER DO THIS
function processData(data: any) { }
```

### 2. Skipping Schema Validation
```typescript
// ❌ WRONG - Assuming data matches schema
function saveUser(data: any): void {
  service.save('users', data, UserSchema);
}

// ✅ CORRECT - Validate first
function saveUser(data: unknown): void {
  const validated = UserSchema.parse(data);
  service.save('users', validated, UserSchema);
}
```

### 3. Ignoring Lint Errors
```typescript
// ❌ NEVER DO THIS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function process(data: any) { }

// ✅ Fix the underlying issue instead
```

### 4. Not Running Full Validation Before Committing
```bash
# ❌ WRONG - Only running unit tests
npm run test

# ✅ CORRECT - Run everything
npm run typecheck && npm run lint && npm run test && npm run test:integration && npm run build
```

### 5. Not Handling External Service Errors
```typescript
// ❌ WRONG - No error handling
async function getData(key: string) {
  return await client.get(key);
}

// ✅ CORRECT - Handle connection and command errors
async function getData(key: string): Promise<string | null> {
  try {
    await this.ensureConnection();
    return await client.get(key);
  } catch (error) {
    this.logger.error('Failed to get data', { key, error });
    throw error;
  }
}
```

---

## Questions?

If you're unsure about:
- **Type safety:** Default to stricter typing, use Zod schemas
- **SOLID principles:** Favor composition and small, focused classes
- **Code organization:** Follow existing file structure
- **Testing:** Write defensive tests first (TDD), test error scenarios
- **Batch operations:** Use existing service patterns

**When in doubt, ask before proceeding.**

---

**Remember: Code quality is not negotiable. Type safety and SOLID principles are requirements, not suggestions.**
