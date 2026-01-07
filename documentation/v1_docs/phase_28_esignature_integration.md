# Phase 28: E-Signature Integration

## Objective
Integrate with an E-Signature provider (DocuSign/HelloSign) to digitally sign contracts.

## Dependencies
- Phase 26

## Tasks
1.  **Provider Setup**
    - Register dev account (e.g., DocuSign).
    - Configure SDK.

2.  **Signature Request API**
    - `POST /api/contracts/:id/sign`: Send for signature.
    - recipient: Investor email.

3.  **Webhook Handler**
    - Listen for "Envelope Complete".
    - Action: Download signed PDF, replace original in S3, mark `contract_signed` = true.

## Technical Considerations
- **Callback**: Ensure webhook is public/reachable (use ngrok for dev).

## Verification
- Trigger sign request.
- Sign document in provider sandbox.
- Webhook updates system state.
