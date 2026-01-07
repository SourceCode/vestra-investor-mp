import { Business, ExpandMore } from '@mui/icons-material';
import { Avatar, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, switchOrganization } from '../../store';

export const OrgSwitcher: React.FC = () => {
    const dispatch = useDispatch();
    const { activeOrganizationId, user } = useSelector((state: RootState) => state.auth);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    if (!user || !user.memberships || user.memberships.length === 0) return null;

    const activeMembership = user.memberships.find(m => m.organizationId === activeOrganizationId);
    const activeOrg = activeMembership?.organization;

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (orgId: string) => {
        dispatch(switchOrganization(orgId));
        handleClose();
    };

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors"
                onClick={handleClick}
                onKeyDown={(e) => e.key === 'Enter' && handleClick(e as any)}
            >
                <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                    {activeOrg?.logo ? (
                        <img src={activeOrg.logo} alt={activeOrg.name} className="w-full h-full object-cover rounded" />
                    ) : (
                        <span className="text-white font-bold text-xs">
                            {activeOrg?.name?.[0] || <Business fontSize="small" />}
                        </span>
                    )}
                </div>
                <div className="hidden md:block">
                    <Typography variant="subtitle2" className="font-bold leading-tight">
                        {activeOrg?.name || 'Select Org'}
                    </Typography>
                    <Typography variant="caption" className="text-slate-500 block leading-none">
                        {activeMembership?.role?.name || 'Member'}
                    </Typography>
                </div>
                <ExpandMore fontSize="small" className="text-slate-400" />
            </div>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        minWidth: 200,
                        mt: 1
                    }
                }}
            >
                <Typography variant="caption" className="px-4 py-2 block text-slate-400 uppercase font-bold tracking-wider">
                    Switch Organization
                </Typography>
                {user.memberships.map((m) => (
                    <MenuItem
                        key={m.organizationId}
                        onClick={() => handleSelect(m.organizationId)}
                        selected={m.organizationId === activeOrganizationId}
                    >
                        <ListItemIcon>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'slate.900' }}>
                                {m.organization.name[0]}
                            </Avatar>
                        </ListItemIcon>
                        <div className="flex flex-col">
                            <Typography variant="body2" className="font-medium">
                                {m.organization.name}
                            </Typography>
                            <Typography variant="caption" className="text-slate-500">
                                {m.role.name}
                            </Typography>
                        </div>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
