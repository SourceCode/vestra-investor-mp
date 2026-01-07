# Phase 38: Performance Optimization

## Objective
Optimize build and runtime performance.

## Dependencies
- All previous phases

## Tasks
1.  **Code Splitting**
    - Analyze bundle with `rollup-plugin-visualizer`.
    - Implement `React.lazy` for heavy routes (Admin Dashboard, Map View).

2.  **Caching Strategy**
    - Redis for frequent API responses (e.g., public deal lists).
    - Browser caching headers (Cache-Control) for static assets.

3.  **Image Optimization**
    - Use Next/Image or specific resizing service (e.g., Thumbor or AWS Lambda @ Edge) for S3 images.
    - Serve WebP format.

## Technical Considerations
- **Metrics**: Monitor Core Web Vitals (LCP, CLS).

## Verification
- Lighthouse Performance score > 90.
- Bundle size reduced.
