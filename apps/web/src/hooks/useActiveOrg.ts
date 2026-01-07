import { useSelector } from 'react-redux';

import { RootState } from '../store';
import { Organization } from '../types';

/**
 * Hook to get the currently active organization details.
 * Returns null if no organization is selected or found.
 */
export const useActiveOrg = (): Organization | null => {
    const { activeOrganizationId, user } = useSelector((state: RootState) => state.auth);

    if (!user || !activeOrganizationId) return null;

    const membership = user.memberships?.find(m => m.organizationId === activeOrganizationId);
    return membership ? membership.organization : null;
};
