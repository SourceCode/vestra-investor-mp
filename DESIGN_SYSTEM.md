# Vestra Design System

## Core Principles
*   **Minimal & Clean:** Focus on data density without clutter.
*   **Premium:** Soft shadows, rounded corners (12-16px), subtle borders.
*   **Responsive:** Mobile-first approach using standard breakpoints.
*   **Accessible:** WCAG AA compliance for contrast and interactivity.

## Color Palette
*   **Primary (Slate):** `#0f172a` (900), `#1e293b` (800), `#334155` (700)
    *   Used for text, primary actions, and branding.
*   **Secondary (Teal):** `#14b8a6` (500), `#0d9488` (600)
    *   Used for accents, success states, and highlights.
*   **Surface:** `#f8fafc` (50), `#ffffff` (White)
    *   Backgrounds.
*   **Semantic:**
    *   Error: `#ef4444` (Rose 500)
    *   Success: `#10b981` (Emerald 500)
    *   Warning: `#f59e0b` (Amber 500)

## Typography
*   **Font:** `Inter`, `Plus Jakarta Sans` (Fallbacks: Sans-Serif)
*   **Scale:**
    *   H1: 4rem (Hero)
    *   H2: 3rem (Page Titles)
    *   H3: 2rem (Section Headers)
    *   Body: 1rem (16px) - Base reading size
    *   Caption: 0.75rem (12px) - Metadata

## Component Guidelines

### Buttons
*   **Primary:** `variant="contained" color="primary"`
    *   Pill shape (`borderRadius: 9999px`)
    *   Used for main calls to action (Submit, Save).
*   **Secondary:** `variant="outlined"`
    *   Used for alternative actions (Cancel, Back).

### Cards
*   **Property Card:**
    *   Image aspect ratio: 4:3 or 16:9
    *   Hover effect: Slight scale up + Shadow
    *   Rounded corners: `xl` (12px or 16px)

### Forms
*   **Inputs:** `variant="outlined"`
*   **Validation:** Inline error messages below input.
*   **Labels:** Always visible or floating.

## Spacing Grid
*   Base unit: 4px
*   Common padding: `p-4` (16px), `p-6` (24px), `p-8` (32px)
*   Layout max-width: `max-w-7xl` (1280px) for dashboards, `max-w-lg` (512px) for forms.

## Accessibility Checklist
1.  All `<img>` tags must have `alt` attributes.
2.  Interactive elements must have focus states.
3.  Text contrast ratio must meet AA standards.
4.  Use semantic HTML (`<main>`, `<nav>`, `<header>`).
