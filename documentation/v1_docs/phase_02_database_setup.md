# Phase 2: Database & TypeORM Setup

## Objective
Set up the PostgreSQL database connection, configure TypeORM for the backend services, and establish the migration infrastructure.

## Dependencies
- Phase 1

## Tasks
1.  **PostgreSQL Environment**
    - Ensure `docker-compose.yml` includes a Postgres service (version 15+).
    - Configure `.env` variables for DB connection (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`).

2.  **TypeORM Configuration**
    - Initialize TypeORM in `services/core` or a dedicated `packages/database` workspace.
    - Create `DataSource` configuration file.
    - Enable SSL/TLS options for production readiness.

3.  **Base Entities Setup**
    - Create abstract `BaseEntity` with:
        - `id` (UUID)
        - `created_at`
        - `updated_at`
        - `deleted_at` (soft delete)
        - `version` (for optimistic locking)

4.  **Migration System**
    - Configure TypeORM CLI scripts in `package.json`.
    - Create an initial "init" migration.
    - Verify `npm run db:migrate` works.

5.  **Seeding Logic**
    - Create a basic seeder script structure.
    - Add a "health check" script to verify DB connectivity.

## Technical Considerations
- **Library**: `typeorm`, `pg`.
- **Naming**: Use `snake_case` for DB columns, `camelCase` for entity properties.
- **Pattern**: Active Record or Data Mapper (adhere to project choice, likely Data Mapper for better separation).

## Verification
- Docker container for Postgres starts.
- TypeORM connects successfully.
- Migrations run without error.
- Tables are created in the database with correct columns.
