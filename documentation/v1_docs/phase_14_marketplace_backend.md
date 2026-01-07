# Phase 14: Marketplace Backend

## Objective
API for Investors to browse and search for published deals.

## Dependencies
- Phase 11

## Tasks
1.  **Marketplace API**
    - `GET /api/marketplace/deals`: List published deals.
    - Filters: `minPrice`, `maxPrice`, `city`, `zip`.

2.  **Permissions Logic**
    - Check if User is `Locked`.
    - If `Locked`: Return restricted dataset (hide specific address, hide agent contact).
    - If `Unlocked`: Return full dataset.

3.  **Pagination**
    - Implement cursor-based or offset-based pagination.

## Technical Considerations
- **Performance**: Ensure database indexes on filtered columns (`price`, `status`, `city`).
- **Security**: STRICT filter `status = 'Published'`. Never show drafts to investors.

## Verification
- Investor hits endpoint.
- Only published deals are returned.
- Locked investor sees redacted info.
