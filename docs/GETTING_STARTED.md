# Getting Started with Homify-v1

Welcome to Homify-v1! This guide will help you set up your development environment and get the application running.

## Prerequisites

Ensure you have the following installed:
-   **Node.js**: v18 or higher (LTS recommended)
-   **Docker**: For running the PostgreSQL database
-   **npm**: v9+ (comes with Node.js)

## Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd homify-v1
    ```

2.  **Install Dependencies**
    We use npm workspaces. Install dependencies from the root:
    ```bash
    npm install
    ```

## Configuration

1.  **Environment Variables**
    Copy the example environment file in `apps/web`:
    ```bash
    cp apps/web/.env.example apps/web/.env
    ```

    Update `apps/web/.env` with your local settings. Defaults are usually sufficient for dev:
    ```env
    PORT=4000
    DATABASE_URL=postgres://user:pass@localhost:5432/homify
    JWT_SECRET=super-secret-key-change-me
    # Optional: AWS Config for Media
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    ```

## Database Setup

1.  **Start PostgreSQL**
    Use Docker Compose to spin up the database:
    ```bash
    npm run db:up -w homify-web
    ```
    *This starts a Postgres container on port 5432.*

2.  **Run Migrations**
    Initialize the database schema:
    ```bash
    npm run db:run -w homify-web
    ```

3.  **Seed Data**
    Populate the database with standard Roles and Permissions:
    ```bash
    # (Assuming a seed script exists, otherwise manual signup is required)
    # npm run db:seed -w homify-web
    ```
    *Note: The system auto-initializes roles on first run if `rbac.seeder.ts` is invoked.*

## Running the Application

1.  **Start Development Server**
    This command starts both the Vite frontend and the Express backend:
    ```bash
    npm run dev -w homify-web
    ```
    -   **Frontend**: http://localhost:5173
    -   **Backend/API**: http://localhost:4000

2.  **Accessing the App**
    Open your browser to `http://localhost:5173`.
    -   **Sign Up**: Create a new account. The first user in a new Organization becomes the `OrgOwner`.

## Testing

Run the full test suite to ensure everything is working:
```bash
npm test -w homify-web
```

## Troubleshooting

-   **Database Connection Failed**: Ensure Docker is running (`docker ps`). Check `.env` credentials.
-   **Type Errors**: Run `npm run typecheck -w homify-web` to diagnose TypeScript issues.
-   **Port Conflicts**: Ensure ports 5173, 4000, and 5432 are free.
