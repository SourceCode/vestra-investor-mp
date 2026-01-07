# Tools & Scripts

Homify-v1 comes with a suite of scripts for development, testing, and deployment.

## Development

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the full stack (Vite + Express). Listens on 5173 (client) and 4000 (server). |
| `npm run server` | Starts **only** the backend Express server with tRPC. Useful for API testing. |
| `npm run preview` | Serves the production build locally. |

## Database

| Command | Description |
| :--- | :--- |
| `npm run db:up` | Starts Postgres via Docker Compose. |
| `npm run db:down` | Stops the Postgres container. |
| `npm run db:generate` | Generates a new migration file based on Entity changes. |
| `npm run db:run` | Applies pending migrations to the database. |
| `npm run db:revert` | Undoes the last migration. |

## Quality & Testing

| Command | Description |
| :--- | :--- |
| `npm test` | Runs the Jest test suite. Use `-- --watch` for interactive mode. |
| `npm run typecheck` | Runs `tsc --noEmit`. validated TypeScript types across the project. |
| `npm run lint` | Runs ESLint to catch code style issues. |

## Build

| Command | Description |
| :--- | :--- |
| `npm run build` | Compiles the TypeScript backend and builds the Vite frontend bundle. Output goes to `dist/`. |

## Miscellaneous

-   **PWA Assets**: The build process automatically generates a Service Worker (`sw.js`) and Manifest via `vite-plugin-pwa`.
-   **Bundle Analysis**: `npm run build` generates a visualization of the bundle size at `dist/stats.html`.
