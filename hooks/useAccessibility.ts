import { useEffect } from 'react';

// Simple dev-only hook to check for basic a11y issues
// In production, robust tools like axe-core should be used
export const useAccessibilityAudit = () => {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            // Check for missing alt text on images
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (!img.hasAttribute('alt')) {
                    console.warn('Accessibility Warning: Image missing alt text. Src:', img.src);
                }
            });

            // Check for buttons without labels (simplified)
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                if (!btn.innerText && !btn.getAttribute('aria-label')) {
                    // Log the outerHTML (truncated) instead of the node reference to avoid circular JSON errors
                    const htmlPreview = btn.outerHTML.substring(0, 150);
                    console.warn('Accessibility Warning: Button missing label or aria-label. Element:', htmlPreview);
                }
            });
        }
    }, []);
};