# Phase 10: Organization Management (Frontend)

## Objective
Admin Dashboard UI for managing the organization.

## Dependencies
- Phase 9

## Tasks
1.  **Admin Dashboard Route**
    - Create `/admin` route (guarded by Admin role).

2.  **User List View**
    - DataGrid showing users: Name, Email, Role, Status.
    - Actions: Edit Role, Remove, Unlock (for investors).

3.  **Invite User Modal**
    - Button "Invite User".
    - Form: Email, Role selection.
    - Call `POST /api/org/users/invite`.

4.  **Settings Page**
    - Form to update Organization Name, Logo URL, generic settings.

## Technical Considerations
- **Components**: Use MUI `DataGrid` or `Table`.
- **State**: Use React Query (`useQuery`, `useMutation`) for data fetching and caching.

## Verification
- Admin can see the list of users.
- Admin can successfully invite a new user.
- Changes in settings reflect immediately (optimistic updates or refetch).
