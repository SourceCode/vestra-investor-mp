# Phase 15: Marketplace Frontend

## Objective
Investor-facing UI for browsing deals. The "Marketplace".

## Dependencies
- Phase 14

## Tasks
1.  **Marketplace Grid/List**
    - Route: `/marketplace`.
    - Component: Grid of `DealCard` components.
    - `DealCard`: Photo, Price, City, basic stats.

2.  **Filter Sidebar**
    - Price Range slider.
    - City/Zip input.
    - Property Type checkboxes.

3.  **Redaction UI**
    - If user is Locked, show "Blur" effect or "Login/Contact to view" on sensitive fields.

## Technical Considerations
- **Responsive**: Grid adapts to screen size (1 col mobile, 3 col desktop).
- **Infinite Scroll**: Use `IntersectionObserver` to load more deals.

## Verification
- User can see deals.
- Filtering updates the list.
- Scroll loads more items.
