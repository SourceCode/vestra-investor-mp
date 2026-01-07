# Phase 25: Transaction Management

## Objective
Manage the lifecycle of a deal after it goes "Under Contract".

## Dependencies
- Phase 24

## Tasks
1.  **Transaction Entity**
    - (Or expand Deal entity).
    - Track steps: `emd_received`, `contract_signed`, `inspection_passed`, `closing_scheduled`.

2.  **Transaction Dashboard**
    - UI for Agent to check off steps.
    - UI for Investor to see progress ("Timeline").

3.  **Automated Updates**
    - Link `emd_received` to Payment Webhook (Phase 24).

## Technical Considerations
- **State Machine**: Define rigorous states for the Closing process.

## Verification
- Move deal to Under Contract.
- View Transaction Timeline.
- Manually check off a step (e.g., Inspection).
- Verify progress bar updates.
