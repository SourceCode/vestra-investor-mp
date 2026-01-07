# Homify-v1

<div align="center">
  <h3>Next-Gen Real Estate Platform</h3>
</div>

Homify-v1 is a comprehensive real estate marketplace and CRM platform built with modern web technologies. It features a robust property search engine, deal management workflows, real-time messaging, and B2B SaaS capabilities for real estate professionals.

## Features

### 🏢 Marketplace
- **Advanced Search**: Filter by price, location, beds/baths, and property types.
- **Saved Searches**: Save criteria and receive alerts (Daily/Weekly/Instant).
- **Interactive Map**: Geospatial visualization of listings.

### 💼 CRM & Management
- **Deal Flow**: Manage offers, contracts, and closings.
- **Contact Management**: Sync with Salesforce/External CRMs.
- **Analytics Dashboard**: Real-time KPIs for revenue and volume.

### 📱 Technical Highlights
- **PWA Ready**: Installable on mobile/desktop with offline asset caching.
- **Security Hardened**: Helmet CSP, Rate Limiting, and JWT Auth.
- **Type-Safe API**: Full-stack type safety with tRPC and TypeScript.
- **Performance**: Server-side compression and optimized bundles.

## Tech Stack

- **Frontend**: React, Vite, Material-UI, TailwindCSS, Recharts
- **Backend**: Node.js, Express, tRPC
- **Database**: PostgreSQL (TypeORM)
- **State**: Redux Toolkit, Redux Saga, TanStack Query

## Getting Started

### Prerequisites
- Node.js v18+
- Docker (for Database)

### Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env` and configure:
    ```env
    DATABASE_URL=postgres://user:pass@localhost:5432/homify
    JWT_SECRET=your_secret
    ```

3.  **Start Database**
    ```bash
    npm run db:up -w homify-web
    ```

4.  **Run Development Server**
    ```bash
    # Starts Frontend (Vite) and Backend (Express)
    npm run dev -w homify-web
    ```
    Access the app at `http://localhost:5173`.

## Scripts

- `npm run dev`: Start dev server.
- `npm run build`: Build for production.
- `npm run server`: Run the backend server strictly.
- `npm test`: Run the full test suite (Jest).
- `npm run typecheck`: Run TypeScript validation.
- `npm run lint`: Run ESLint.

## API Documentation

### Documentation Suite
-   [**Getting Started**](docs/GETTING_STARTED.md): Setup, installation, and first-time configuration.
-   [**System Architecture**](docs/SYSTEM_ARCHITECTURE.md): High-level design, modules, and tech stack.
-   [**Database Schema**](docs/DATABASE_SCHEMA.md): Entity relationships and key tables.
-   [**API Reference**](docs/API.md): tRPC endpoints and usage.
-   [**Tools & Scripts**](docs/TOOLS.md): Command reference.


## Deployment

The application is built as a static frontend (`dist`) and a Node.js API server.

1.  **Build**
    ```bash
    npm run build -w homify-web
    ```

2.  **Serve**
    Deploy the `dist` folder to a CDN or static host.
    Run `npm run server -w homify-web` on your backend infrastructure.
