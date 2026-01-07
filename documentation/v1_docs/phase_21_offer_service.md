# Phase 21: Offer Service

## Objective
Backend service to handle Offer submission and management.

## Dependencies
- Phase 11, Phase 19

## Tasks
1.  **Offer Entity**
    - Fields: `deal_id`, `investor_id`, `amount`, `status` (Pending, Accepted, Rejected, Withdrawn), `conditions` (text), `valid_until`.

2.  **API Endpoints**
    - `POST /api/offers`: Submit offer.
    - `GET /api/offers`: List my offers (Investor) or Deal offers (Agent).
    - `POST /api/offers/:id/status`: Accept/Reject (Agent only).

3.  **Business Logic**
    - Validate offer amount (optional: > min price).
    - Prevent multiple active offers from same investor on same deal? (Business rule).
    - Emit `offer.created` and `offer.accepted` events.

## Technical Considerations
- **Concurrency**: Handle race conditions if multiple agents try to accept different offers (Database transaction/locking).

## Verification
- Investor creates offer.
- Agent sees offer.
- Agent accepts offer -> Offer status updates.
