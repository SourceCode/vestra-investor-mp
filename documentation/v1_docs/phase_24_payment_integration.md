# Phase 24: Payment Integration (Down Payments)

## Objective
Integrate Stripe (or similar) to collect Earnest Money Deposits (EMD).

## Dependencies
- Phase 21

## Tasks
1.  **Stripe Setup**
    - Install `stripe` node package.
    - Configure API keys.

2.  **Payment Intent API**
    - `POST /api/payments/intent`: Create PaymentIntent for the EMD amount.
    - Metadata: `deal_id`, `offer_id`.

3.  **Webhook Handler**
    - Endpoint: `/api/webhooks/stripe`.
    - Listen for `payment_intent.succeeded`.
    - Action: Mark Offer as "Funded", Deal as "Under Contract".

4.  **Frontend Integration**
    - Use `@stripe/react-stripe-js`.
    - "Pay Deposit" button on Accepted Offer view.

## Technical Considerations
- **Security**: Never store card details. Use Stripe Elements.
- **Idempotency**: Ensure webhook doesn't double-process.

## Verification
- Simulate successful payment in Stripe Test Mode.
- Webhook fires.
- Deal status updates to Under Contract.
