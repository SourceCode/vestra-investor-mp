import { Assessment, Dashboard, EmojiEvents, Favorite, Logout, Person, Settings } from '@mui/icons-material';
import { Container, Divider, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { logout } from '../store';

interface AccountShellProps {
    children: React.ReactNode;
    title: string;
}

const AccountShell: React.FC<AccountShellProps> = ({ children, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const menuItems = [
        { icon: <Person />, label: 'Profile', path: '/account/profile' },
        { icon: <Dashboard />, label: 'Investing Criteria', path: '/account/preferences' },
        { icon: <Assessment />, label: 'Analytics', path: '/analytics' },
        { icon: <EmojiEvents />, label: 'Rewards', path: '/rewards' }, // Added
        { icon: <Favorite />, label: 'Saved Deals', path: '/saved' },
        { icon: <Settings />, label: 'Settings', path: '/account/settings' },
    ];

    return (
        <Container maxWidth="xl" className="py-8 min-h-[calc(100vh-80px)]">
            <Grid container spacing={4}>
                {/* Sidebar */}
                <Grid size={{ xs: 12, md: 3, lg: 2 }}>
                    <Paper elevation={0} className="border border-slate-200 rounded-xl overflow-hidden">
                        <List component="nav" className="p-2">
                            {menuItems.map(item => (
                                <ListItemButton
                                    key={item.path}
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
                                    className="rounded-lg mb-1"
                                    sx={{
                                        '&.Mui-selected': { bgcolor: '#f1f5f9', color: '#0f172a' },
                                        '&:hover': { bgcolor: '#f8fafc' }
                                    }}
                                >
                                    <ListItemIcon className={location.pathname === item.path ? 'text-slate-900' : 'text-slate-400'}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                            ))}
                            <Divider className="my-2" />
                            <ListItemButton onClick={() => { dispatch(logout()); navigate('/'); }} className="rounded-lg text-rose-600 hover:bg-rose-50">
                                <ListItemIcon className="text-rose-600"><Logout /></ListItemIcon>
                                <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 500 }} />
                            </ListItemButton>
                        </List>
                    </Paper>
                </Grid>

                {/* Content */}
                <Grid size={{ xs: 12, md: 9, lg: 10 }}>
                    {title && (
                        <div className="mb-6">
                            <Typography variant="h4" className="font-bold text-slate-900">{title}</Typography>
                        </div>
                    )}
                    {children}
                </Grid>
            </Grid>
        </Container>
    );
};

export default AccountShell;
