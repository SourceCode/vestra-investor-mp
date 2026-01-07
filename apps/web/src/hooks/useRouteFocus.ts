import { useEffect, RefObject } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically moves focus to the main content wrapper or the first H1
 * when the route changes. This ensures screen reader users are not left
 * at the bottom of the page or on the navigation.
 * 
 * @param mainRef - Optional ref to the main content container
 */
export const useRouteFocus = (mainRef?: RefObject<HTMLElement | null>) => {
    const location = useLocation();

    useEffect(() => {
        // Small timeout to allow DOM to update/render new content
        const timer = setTimeout(() => {
            // Priority 1: Use the provided ref
            if (mainRef?.current) {
                mainRef.current.focus();
                return;
            }

            // Priority 2: Try to find an element with id="main-content"
            const mainById = document.getElementById('main-content');
            if (mainById) {
                mainById.focus();
                return;
            }

            // Priority 3: Fallback to the first H1
            const h1 = document.querySelector('h1');
            if (h1) {
                (h1 as HTMLElement).focus();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [location.pathname, mainRef]);
};
