# Phase 9: Organization Management (Backend)

## Objective
Backend API for Organization Admins to manage their tenant settings and users.

## Dependencies
- Phase 5

## Tasks
1.  **User Management API**
    - `GET /api/org/users`: List all users in tenant (with pagination).
    - `POST /api/org/users/invite`: Send invite email (stub).
    - `PUT /api/org/users/:id/role`: Change user role (e.g., promote to Agent).
    - `DELETE /api/org/users/:id`: Remove user from org.

2.  **Settings API**
    - `GET /api/org/settings`: Get org config.
    - `PUT /api/org/settings`: Update branding, contact info.

3.  **Invite System Logic**
    - Generate unique invite token.
    - Store in `Invite` table (`email`, `org_id`, `role`, `token`, `expires_at`).

## Technical Considerations
- **Security**: Strict check that requester is `OrgAdmin` or `OrgOwner`.
- **Audit**: Log these administrative actions.

## Verification
- Admin can list users.
- Admin can change a user's role.
- Non-admin receives 403.
