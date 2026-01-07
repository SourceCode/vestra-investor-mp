# Phase 7: Investor Onboarding (Backend)

## Objective
Backend logic for registering and managing investor profiles.

## Dependencies
- Phase 5

## Tasks
1.  **InvestorProfile Entity**
    - Create `InvestorProfile` entity.
    - Fields: `user_id`, `organization_id`, `status` (Locked/Unlocked), `phone`, `investment_criteria` (JSON).
    - Link to `User` and `Organization`.

2.  **Onboarding API**
    - `POST /api/investors/onboard`: Create profile, set status to Locked.
    - `POST /api/investors/:id/unlock`: Admin/Agent action to unlock.
    - `GET /api/investors/me`: Get current investor profile.

3.  **Notification Trigger**
    - Emit event `investor.registered` upon signup.
    - (Actual email sending is in a later phase, but log the event).

4.  **Validation**
    - Ensure unique email within tenant (or globally, depending on design).
    - Validate phone number format.

## Technical Considerations
- **Separation**: Keep Investor logic separate from generic User logic.
- **Security**: Only agents/admins of the same tenant can unlock.

## Verification
- Register an investor via API. Check DB for `Locked` status.
- Admin calls `unlock` endpoint. Check DB for `Unlocked` status.
- Investor cannot unlock themselves.
