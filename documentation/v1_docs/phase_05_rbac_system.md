# Phase 5: RBAC System Implementation

## Objective
Implement Role-Based Access Control. Define roles and permissions to restrict access to specific resources and actions.

## Dependencies
- Phase 4

## Tasks
1.  **Role & Permission Entities**
    - Create `Role` entity (e.g., Owner, Admin, Agent, Investor).
    - Create `Permission` entity (e.g., `deal:create`, `deal:read`, `settings:update`).
    - Create `RolePermission` join table.

2.  **Seeding Roles**
    - specific script to seed default roles and permissions as defined in PRD.
    - Standard Roles: `OrgOwner`, `OrgAdmin`, `AcquisitionAgent`, `DispositionAgent`, `Investor`.

3.  **Guard Middleware**
    - Create `requirePermission(permission)` middleware.
    - Check if the current user's role in the current tenant has the required permission.

4.  **ABAC Hooks (Optional/Basic)**
    - Prepare structure for Attribute-Based Access Control (e.g., "Agent can only edit *their* deals").
    - Implement a `checkOwnership` utility.

## Technical Considerations
- **Performance**: Cache role permissions if possible (Redis or in-memory) to avoid DB hits on every request.
- **Granularity**: Define permissions as `resource:action`.

## Verification
- Assign 'Investor' role to a user.
- Attempt to access an admin-only route (e.g., `org:settings`). Verify 403 Forbidden.
- Assign 'Admin' role. Verify access is granted.
