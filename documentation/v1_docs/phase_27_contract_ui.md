# Phase 27: Contract UI

## Objective
Allow users to view and download generated contracts.

## Dependencies
- Phase 26

## Tasks
1.  **Documents Tab**
    - In Deal Detail / Transaction View.
    - List generated contracts.

2.  **Preview/Download**
    - Button to "View PDF" (opens in new tab).

3.  **Regenerate**
    - (Agent only) Button to regenerate if details changed.

## Technical Considerations
- **Security**: Use S3 presigned URLs (short expiry) for viewing.

## Verification
- Generate contract.
- Click View.
- PDF opens.
