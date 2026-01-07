# Phase 23: Offer Management (Agent)

## Objective
Frontend for Agents to review and act on offers.

## Dependencies
- Phase 21

## Tasks
1.  **Offers Tab on Deal**
    - In Deal Management, add "Offers" tab.
    - List all offers for this deal.

2.  **Action Buttons**
    - "Accept", "Reject", "Counter" (optional).
    - Accept triggers confirmation modal ("This will mark deal pending...").

3.  **Comparison View**
    - Table comparing Amount, Conditions, Investor credibility.

## Technical Considerations
- **Real-time**: Ideally update list when new offer comes in (Polling).

## Verification
- View offers on a deal.
- Click Accept.
- Verify Deal status updates to "Pending" (or similar).
