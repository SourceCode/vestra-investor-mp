# Phase 13: Deal Creation (Frontend)

## Objective
Frontend interface for Agents to input property details and upload photos.

## Dependencies
- Phase 11, Phase 12

## Tasks
1.  **Deal Form UI**
    - Route: `/deals/new` and `/deals/:id/edit`.
    - Fields: Multi-step form (Address -> Financials -> Description).

2.  **Image Upload Component**
    - Dropzone area.
    - Integration:
        1. Select file.
        2. Call `POST /api/media/upload-url`.
        3. PUT file to S3.
        4. Add S3 Key/URL to the Deal form state.

3.  **Publish Action**
    - Button to save as Draft vs. Publish immediately.

## Technical Considerations
- **UX**: Show preview of uploaded images. Allow reordering.
- **State**: Manage form state with `react-hook-form` and `zod` resolver.

## Verification
- Agent can fill out form and submit.
- Images are uploaded and linked to the deal.
- Deal shows up in the dashboard.
