import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Button, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Settings, Palette, People, Security, Public, Extension, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, fetchOrgSettingsRequest } from '../../store';

interface OrgSettingsShellProps {
    children: React.ReactNode;
}

const OrgSettingsShell: React.FC<OrgSettingsShellProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { settings, loading } = useSelector((state: RootState) => state.organization);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!settings) dispatch(fetchOrgSettingsRequest());
    }, [dispatch, settings]);

    const menuItems = [
        { label: 'General', icon: <Settings />, path: '/org/settings' },
        { label: 'Branding', icon: <Palette />, path: '/org/settings/branding' },
        { label: 'Users', icon: <People />, path: '/org/settings/users' },
        { label: 'Roles & Permissions', icon: <Security />, path: '/org/settings/roles' },
        { label: 'Markets', icon: <Public />, path: '/org/settings/markets' },
        { label: 'Integrations', icon: <Extension />, path: '/org/settings/integrations' },
    ];

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <AppBar position="fixed" color="default" elevation={0} className="border-b border-slate-200 bg-white z-50">
                <Toolbar>
                    <IconButton onClick={() => navigate('/agent/dashboard')} className="mr-2">
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" className="font-bold text-slate-900 flex-grow">
                        Organization Settings
                    </Typography>
                    <div className="flex items-center gap-3">
                        <Typography variant="caption" className="text-slate-500 hidden sm:block">
                            {user?.company || settings?.name}
                        </Typography>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: settings?.primaryColor }}>{user?.firstName[0]}</Avatar>
                    </div>
                </Toolbar>
            </AppBar>

            <div className="flex flex-grow pt-16">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-40">
                    <List className="p-4 space-y-1">
                        {menuItems.map(item => (
                            <ListItemButton 
                                key={item.path} 
                                selected={location.pathname === item.path}
                                onClick={() => navigate(item.path)}
                                className="rounded-lg mb-1"
                                sx={{
                                    '&.Mui-selected': { bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 600 },
                                    '&:hover': { bgcolor: '#f8fafc' }
                                }}
                            >
                                <ListItemIcon className={location.pathname === item.path ? 'text-slate-900' : 'text-slate-400'}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400 }} />
                            </ListItemButton>
                        ))}
                    </List>
                </div>

                {/* Content */}
                <div className="flex-grow md:ml-64 p-8 max-w-5xl">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default OrgSettingsShell;
