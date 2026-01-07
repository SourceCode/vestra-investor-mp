# Phase 16: Deal Detail View

## Objective
Detailed view of a single property, including photo gallery, map, and financial breakdown.

## Dependencies
- Phase 14

## Tasks
1.  **Detail Page Route**
    - Route: `/marketplace/:id`.

2.  **Gallery Component**
    - Carousel/Grid for property photos.
    - Lightbox for full-screen view.

3.  **Financials Section**
    - Display Price, ARV, Estimated Rent, ROI (calculated).

4.  **Agent Contact Card**
    - Show assigned agent's name and photo.
    - "Message Agent" button (links to Phase 18).

5.  **Access Control**
    - If Locked, show overlay: "Contact Agent to unlock full details."

## Technical Considerations
- **Map**: Integrate Google Maps or Mapbox (optional for MVP, or just static map).
- **SEO**: Dynamic title/meta tags (though app is behind auth mostly).

## Verification
- Click on deal in Marketplace -> Opens detail view.
- All info matches DB.
- Back button works.
