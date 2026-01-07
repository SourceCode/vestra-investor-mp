# Phase 11: Deal Service Foundation

## Objective
Implement the backend service for managing Real Estate Deals. This includes the core `Deal` entity and CRUD operations for Agents.

## Dependencies
- Phase 2, Phase 5

## Tasks
1.  **Deal Entity**
    - Create `Deal` entity.
    - Fields:
        - `title`, `description`
        - `address_line1`, `city`, `state`, `zip`, `location` (Point)
        - `price`, `arv` (After Repair Value), `rehab_estimate`
        - `status` (Draft, Published, Under Contract, Sold, Archived)
        - `assigned_agent_id` (FK to User)
        - `organization_id` (FK to Organization)

2.  **CRUD API**
    - `POST /api/deals`: Create a deal (Default status: Draft).
    - `PUT /api/deals/:id`: Update details.
    - `DELETE /api/deals/:id`: Soft delete.
    - `GET /api/deals/manage`: List deals for Agent (all deals in org or assigned to them).

3.  **State Machine Logic**
    - Implement valid transitions (e.g., cannot go from Draft to Sold directly).
    - Helper methods: `publish()`, `archive()`.

## Technical Considerations
- **Validation**: Strict Zod schema for money fields (handle decimals correctly, maybe store as integer cents or `decimal` type).
- **Access**: Only Agents/Admins can Create/Update.

## Verification
- Agent can create a deal.
- Created deal appears in the management list.
- Invalid status transition throws error.
