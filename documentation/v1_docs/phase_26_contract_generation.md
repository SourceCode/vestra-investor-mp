# Phase 26: Contract Generation Service

## Objective
Generate PDF contracts dynamically based on Deal and Offer data.

## Dependencies
- Phase 25

## Tasks
1.  **PDF Library**
    - Install `pdfkit` or `puppeteer`.

2.  **Template Engine**
    - Create HTML/Handlebars templates for "Assignment Contract".
    - Placeholders: `{{investorName}}`, `{{propertyAddress}}`, `{{price}}`.

3.  **Generation API**
    - `POST /api/contracts/generate`: Input `deal_id`.
    - Output: PDF stream or S3 URL.
    - Store document reference in `Deal` documents.

## Technical Considerations
- **Formatting**: Ensure legal text is preserved and readable.
- **Storage**: Save generated PDF to S3 immediately.

## Verification
- Call generation endpoint.
- Download PDF.
- Verify placeholders are replaced with correct data.
