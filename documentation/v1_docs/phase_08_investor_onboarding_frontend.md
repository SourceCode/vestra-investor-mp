# Phase 8: Investor Onboarding (Frontend)

## Objective
Frontend UI for investor sign-up and profile management.

## Dependencies
- Phase 6, Phase 7

## Tasks
1.  **Registration Page**
    - Create `/register` route.
    - Form: Name, Email, Password, Phone, "I am an Investor" checkbox.
    - Integration: Call `POST /auth/register`.

2.  **Onboarding Wizard**
    - After signup, redirect to `/onboarding`.
    - Form: Investment goals, Preferred locations, Budget.
    - Submit to `POST /api/investors/onboard`.

3.  **Status Banner**
    - If status is `Locked`, show a banner: "Your account is pending approval. Contact an agent."
    - Disable restricted navigation items.

4.  **Profile Page**
    - UI to view and edit profile details.

## Technical Considerations
- **UX**: Clean, multi-step form for onboarding.
- **Feedback**: Show success/error toasts using a toast library (e.g., `notistack` or `react-hot-toast`).

## Verification
- User can complete registration.
- User is redirected to onboarding.
- Locked banner appears for new users.
