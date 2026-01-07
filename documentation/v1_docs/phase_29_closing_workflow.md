# Phase 29: Closing Workflow

## Objective
Finalize the deal, handle closing logic, and archiving.

## Dependencies
- Phase 25

## Tasks
1.  **Closing Action**
    - Agent clicks "Mark Closed".
    - Validation: Ensure all steps (EMD, Contract) are complete.

2.  **Archive Logic**
    - Update status to `Sold`.
    - Remove from active Marketplace listings.
    - Trigger "Deal Closed" email to Investor.

3.  **Post-Sale Hooks**
    - Placeholder for Loyalty points (Phase 31) or CRM sync.

## Technical Considerations
- **Data Retention**: Sold deals are valuable for Analytics (Comps). Do not delete.

## Verification
- Complete transaction checklist.
- Click Close.
- Deal disappears from Marketplace.
- Deal appears in "Sold" history.
