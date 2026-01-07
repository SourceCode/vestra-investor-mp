# WebOS v2 Project Configuration

> **Project Identity**: WebOS v3 (Source Code Corpus)
> **Stack**: React, Vite, TypeScript, SQLite (wasm), Redux Toolkit, Redux Saga, TanStack Query

## 1. Environment & Tooling
- **Node.js**: `v24.12.0` (LTS) - *Strictly Enforced*
- **Package Manager**: `npm` (>=10.0.0)
- **Build Tool**: Vite
- **Test Runner**: Jest

### commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Test**: `npm test`
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`
- **Validate**: `npm run verify` (Runs test + lint + typecheck)

## 2. Architecture & Directory Structure
- **Apps**: `src/apps/{app_name}/` (e.g., `src/apps/drivers/`)
  - Entry: `{AppName}App.tsx`
  - Registry: `src/apps/registry.tsx`
- **Shared UI**: `src/components/shared/`
- **Database**: `src/db/`
  - Schemas: `src/db/schemas/` (SQL files, 1XXX_tablename.sql)
  - Entities: `src/db/entities/` (TypeORM entities)
  - Mappers: `src/db/mappers/`
- **Services**: `src/services/` (Singleton pattern, `src/services/{entity}.service.ts`)
- **State**: `src/store/` (Redux slices, Sagas)

## 3. Coding Standards (Strict Enforcement)

### 3.1 Naming Conventions
- **Domain/JS Properties**: `camelCase` (e.g., `firstName`, `createDate`)
- **Database Columns**: `snake_case` (e.g., `first_name`, `create_date`)
- **React Components**: `PascalCase`
- **Files**:
  - Components: `PascalCase.tsx`
  - Utilities/Services: `camelCase.ts`

### 3.2 Database & Data Model
- **Audit Fields** (Required on ALL tables):
  - `id` (Primary Key, specific prefix e.g., `c-`, `e-`)
  - `create_date`, `update_date`
  - `created_by_id`, `updated_by_id`
  - `version_num`, `version_note`
  - `is_active` (Soft delete flag)
- **Type Safety**:
  - NO `any` type allowed. Use `unknown` or specific interfaces.
  - Zod Schemas required for all entities (`src/lib/schemas/`).
  - Mappers required to translate DB `snake_case` <-> Domain `camelCase`.

### 3.3 State Management
- **Local UI State**: `useState`, `useReducer`
- **Global Server State**: `useQuery` (React Query) preferred for data fetching.
- **Global App State**: Redux Toolkit (Slices) + Sagas for complex side-effects.
- **OS Interaction**: Must use `useOS()` hook (windowing, toasts, modal management).

### 3.4 Styling
- **Engine**: TailwindCSS + CSS Variables.
- **Theme Variables**: Use `--os-*` variables (e.g., `--os-bg`, `--os-accent`, `--os-text`).
- **Forbidden**: Hardcoded hex colors in components.

## 4. Development Workflow

### 4.1 Creating a New App
1. Create directory `src/apps/{name}`.
2. Create `{Name}App.tsx`.
3. Register in `src/apps/registry.tsx`.
4. Add icon and metadata.

### 4.2 Database Changes
1. Create/Update SQL schema in `src/db/schemas/`.
2. Update Entity interface in `src/db/interfaces.ts`.
3. Update/Create Zod schema.
4. Update/Create Mapper.
5. Run `npm run db:gen-schemas` (if applicable) or manual sync.

### 4.3 Validation
Before pushing or marking task complete:
1. `npm run typecheck` (Must be clean)
2. `npm run lint` (Must be clean)
3. `npm test` (Relevant tests must pass)

## 5. Agent Instructions
- **File Edits**: Always prefer targeting specific lines over full file rewrites.
- **Context**: Check `task.md` for current objective.
- **Artifacts**: Store plans/logs in `.gemini/antigravity/brain/`.
- **Search**: Use `grep_search` or `find_by_name` before asking user for file locations.

## 6. MCP & Tools
- Use `@mcp:antigravity-connector` for specialized analysis (schema, redux, components).
- Use `vector_search` for semantic discovery of existing patterns.
