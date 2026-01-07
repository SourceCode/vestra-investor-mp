# Phase 35: Search UI Enhancements

## Objective
Upgrade the Marketplace UI with advanced search features.

## Dependencies
- Phase 34

## Tasks
1.  **Search Bar**
    - Auto-complete dropdown.
    - Full-text search input.

2.  **Advanced Filters**
    - Map-based search (Search within map bounds).
    - Multi-select for Property Type.

3.  **Map Integration**
    - Show pins on map for search results.
    - Click pin -> Scroll to card.

## Technical Considerations
- **Debounce**: Debounce search input to avoid flood of API calls.

## Verification
- Type in search bar.
- Results update instantly.
- Pan map -> Results update to visible area.
