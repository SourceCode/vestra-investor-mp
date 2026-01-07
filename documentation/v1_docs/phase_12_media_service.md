# Phase 12: Media Service (Images/Docs)

## Objective
Implement a service to handle file uploads (property photos, documents) using AWS S3.

## Dependencies
- Phase 3

## Tasks
1.  **AWS S3 Setup**
    - Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
    - Configure AWS credentials from env.

2.  **Presigned URL API**
    - `POST /api/media/upload-url`: Client requests a URL to upload a file.
    - Input: `filename`, `contentType`.
    - Output: `uploadUrl` (PUT), `key` (S3 path).

3.  **Media Entity (Optional)**
    - Create `Media` entity to track uploads if needed, or just store arrays of URLs in `Deal` entity.
    - Recommendation: `DealImage` entity linked to `Deal`.

4.  **Local Dev Mock**
    - If `NODE_ENV=development`, maybe mock S3 or use a local folder/MinIO.

## Technical Considerations
- **Security**: Validate file types (images, PDFs) and size limits before generating URL.
- **Optimization**: Frontend should upload directly to S3 to save server bandwidth.

## Verification
- Request upload URL.
- Upload file using curl/Postman to that URL.
- Verify file exists in S3 bucket.
