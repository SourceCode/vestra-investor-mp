import { useSelector } from 'react-redux';

import { RootState } from '../store';

/**
 * Hook to check if the current user has a specific permission in the active organization.
 */
export const usePermission = () => {
    const { activeOrganizationId, user } = useSelector((state: RootState) => state.auth);

    /**
     * Checks if the user has the required permission action.
     * @param action The permission string to check (e.g. 'deal:create')
     */
    const hasPermission = (action: string): boolean => {
        if (!user || !activeOrganizationId) return false;

        // Admins have all permissions
        if (user.role === 'ADMIN') return true;

        const membership = user.memberships?.find(m => m.organizationId === activeOrganizationId);
        if (!membership || !membership.role) return false;

        // Check if role has the specific permission
        return membership.role.permissions.some(p => p.action === action);
    };

    return { hasPermission };
};
