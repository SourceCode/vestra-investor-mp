# Phase 22: Offer UI (Investor)

## Objective
Frontend for Investors to submit offers.

## Dependencies
- Phase 21

## Tasks
1.  **Make Offer Modal**
    - Button on Deal Detail page: "Make Offer".
    - Form: Amount, Conditions, Expiry Date.
    - Submit to `POST /api/offers`.

2.  **My Offers Page**
    - Route: `/my-offers`.
    - List showing status of all submitted offers.

3.  **Offer Detail View**
    - View offer history/status.

## Technical Considerations
- **Validation**: Ensure amount is numeric and reasonable.
- **Feedback**: Success modal "Offer Submitted!".

## Verification
- Submit form.
- Redirect to My Offers.
- Verify entry exists.
