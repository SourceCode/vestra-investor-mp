# Phase 32: Analytics Service (Backend)

## Objective
Backend service to aggregate and serve analytics data.

## Dependencies
- Phase 2

## Tasks
1.  **Event Tracking**
    - Ensure all key services emit events: `deal.viewed`, `offer.created`, `user.login`.
    - Store events in `AnalyticsEvents` table (or specialized TSDB).

2.  **Aggregation Queries**
    - `GET /api/analytics/summary`:
        - Active Investors Count.
        - Total Deals Published.
        - Total GMV (Gross Merchandise Value - Sum of Sold Deals).
    - `GET /api/analytics/conversion`: Funnel data (View -> Offer -> Contract).

## Technical Considerations
- **Performance**: Use materialized views if aggregation is slow.
- **Privacy**: Anonymize data if needed for aggregate reporting.

## Verification
- Generate activity.
- Call summary endpoint.
- Verify numbers match.
