# Phase 4: Multi-Tenancy Foundation

## Objective
Implement the architecture for multi-tenancy. Every request must be scoped to an Organization. Ensure data isolation.

## Dependencies
- Phase 3

## Tasks
1.  **Organization Entity**
    - Create `Organization` entity.
    - Fields: `name`, `slug` (unique), `settings` (JSONB).

2.  **User-Organization Relationship**
    - Create `UserOrganization` (or `OrganizationMember`) entity.
    - Fields: `user_id`, `organization_id`, `role_id`.
    - Many-to-Many relationship between User and Organization.

3.  **Tenant Middleware**
    - Create Express middleware `extractTenant`.
    - Logic: Extract tenant ID from Header (`x-tenant-id`) or subdomain.
    - Verify user belongs to this tenant (using the JWT).
    - Attach `tenantId` to the request object.

4.  **Tenant-Aware Repository/Service**
    - Create a base service or repository wrapper that automatically adds `.where({ organizationId: tenantId })` to queries.
    - **Critical**: Ensure this is applied by default to avoid data leaks.

5.  **Update Auth Flows**
    - Update `register`: Create a default Organization or link to an existing one via invite code.
    - Update `login`: Return list of organizations the user belongs to.

## Technical Considerations
- **Isolation**: Logical isolation via `organization_id` column on all tenant-specific tables.
- **Safety**: Use RLS (Row Level Security) in Postgres if possible, or strict ORM scopes.

## Verification
- Create two users in different organizations.
- Verify User A cannot fetch data belonging to Organization B.
- Middleware rejects requests without valid tenant context.
