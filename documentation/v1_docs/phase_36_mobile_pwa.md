# Phase 36: Mobile Responsiveness & PWA

## Objective
Optimize the application for mobile devices and enable PWA features.

## Dependencies
- Phase 6

## Tasks
1.  **PWA Manifest**
    - specific `manifest.json`.
    - Icons (192, 512).
    - Service Worker for offline fallback (Vite PWA plugin).

2.  **Mobile UI Audit**
    - Fix table overflows.
    - Ensure touch targets are large enough (44px+).
    - Convert complex forms to wizards on mobile.

3.  **App Shell**
    - Implement "Add to Home Screen" prompt.

## Technical Considerations
- **Testing**: Use Chrome DevTools Device Mode and real devices.

## Verification
- Audit with Lighthouse (Target 90+ PWA score).
- Install on phone.
- Open while offline (should show shell).
