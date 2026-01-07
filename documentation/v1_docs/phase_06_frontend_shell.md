# Phase 6: Frontend Shell & Architecture

## Objective
Set up the main React application shell, routing, theme, and layout structure.

## Dependencies
- Phase 1

## Tasks
1.  **React Setup**
    - Initialize `apps/web` with Vite + React + TypeScript.
    - Configure `react-router-dom`.

2.  **UI Library Configuration**
    - Install Material UI (MUI) and Tailwind CSS.
    - Configure Tailwind to work with MUI (or separate, per `STANDARDS.md`).
    - Create a `theme.ts` with project colors and typography.

3.  **Layout Components**
    - Create `MainLayout` (Sidebar, Topbar, Content Area).
    - Create `AuthLayout` (Centered box for Login/Register).
    - Create `DashboardLayout` (for logged-in users).

4.  **State Management (Redux/Context)**
    - Install `@reduxjs/toolkit` and `react-redux`.
    - Setup `store.ts`.
    - Create `authSlice` to store User and Token.

5.  **Navigation**
    - Create sidebar navigation config based on user roles (dynamic menu).

## Technical Considerations
- **Responsive**: Ensure layouts work on mobile.
- **Micro-frontends**: If strictly following PRD, prepare Module Federation config, but for MVP monorepo import is acceptable initially.

## Verification
- App loads without errors.
- Routing works between Login and Dashboard.
- Theme is applied correctly.
- Mobile view shows a hamburger menu.
