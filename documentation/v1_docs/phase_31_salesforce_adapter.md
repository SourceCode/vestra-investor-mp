# Phase 31: Salesforce Adapter

## Objective
Implement the concrete CRM Adapter for Salesforce.

## Dependencies
- Phase 30

## Tasks
1.  **Salesforce API Client**
    - Use `jsforce` library.
    - Implement authentication (OAuth2 flow or Username/Password/SecurityToken for MVP).

2.  **Mapping Logic**
    - Map `InvestorProfile` -> Salesforce `Contact`.
    - Map `Deal` -> Salesforce `Opportunity` (or Custom Object).
    - Map `Offer` -> Salesforce `Opportunity` Stage/Amount.

3.  **Sync Implementation**
    - `syncInvestor(investorId)`: Push changes to SF.
    - `syncDeal(dealId)`: Push changes to SF.

## Technical Considerations
- **Rate Limits**: Handle Salesforce API limits.
- **Field Mapping**: Allow configuration via JSON settings if possible (advanced).

## Verification
- Configure Salesforce credentials.
- Update an investor.
- Verify change appears in Salesforce Sandbox.
