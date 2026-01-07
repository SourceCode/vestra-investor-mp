import React from 'react';
import { Container, Grid, Typography, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Person, Dashboard, Favorite, Settings, Logout, Assessment, EmojiEvents } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
        { label: 'Profile', path: '/account/profile', icon: <Person /> },
        { label: 'Investing Criteria', path: '/account/preferences', icon: <Dashboard /> },
        { label: 'Analytics', path: '/analytics', icon: <Assessment /> },
        { label: 'Rewards', path: '/rewards', icon: <EmojiEvents /> }, // Added
        { label: 'Saved Deals', path: '/saved', icon: <Favorite /> },
        { label: 'Settings', path: '/account/settings', icon: <Settings /> },
    ];

    return (
        <Container maxWidth="xl" className="py-8 min-h-[calc(100vh-80px)]">
             <Grid container spacing={4}>
                 {/* Sidebar */}
                 <Grid item xs={12} md={3} lg={2}>
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
                 <Grid item xs={12} md={9} lg={10}>
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
