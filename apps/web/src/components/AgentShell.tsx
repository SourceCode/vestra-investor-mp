import { Assessment, Business, Chat, ChevronLeft, Dashboard, Description, Handshake, Logout, Menu as MenuIcon, People, Settings } from '@mui/icons-material';
import { AppBar, Avatar, Box, Button, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTenant } from '../contexts/TenantConfigContext';

import { logout, RootState } from '../store';
import { useRouteFocus } from '../hooks/useRouteFocus';
import SkipLink from './SkipLink';

const drawerWidth = 260;

interface AgentShellProps {
  children: React.ReactNode;
}

const AgentShell: React.FC<AgentShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const tenant = useTenant();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const mainRef = React.useRef<HTMLElement>(null);
  useRouteFocus(mainRef);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Role Guard
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { icon: <Dashboard />, path: '/agent/dashboard', text: 'Dashboard' },
    { icon: <Business />, path: '/agent/deals', text: 'Deals' },
    { icon: <People />, path: '/agent/investors', text: 'Investors' },
    { icon: <Description />, path: '/agent/offers', text: 'Offers' },
    { icon: <Handshake />, path: '/agent/referrals', text: 'Referrals' }, // Added
    { icon: <Chat />, path: '/agent/messages', text: 'Messages' },
    { icon: <Assessment />, path: '/agent/analytics', text: 'Analytics' },
  ];

  const drawer = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-slate-900 font-bold mr-3">V</div>
        <Typography variant="h6" className="font-bold text-white tracking-tight">Agent Desk</Typography>
      </div>
      <List className="px-3 py-4 flex-grow">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding className="mb-1">
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              className={`rounded-lg ${location.pathname === item.path ? 'bg-teal-600 text-white' : 'hover:bg-slate-800'}`}
            >
              <ListItemIcon className={location.pathname === item.path ? 'text-white' : 'text-slate-400'}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider className="border-slate-700" />
      <List className="px-3">
        <ListItem disablePadding>
          <ListItemButton className="rounded-lg hover:bg-slate-800" onClick={() => navigate('/org/settings')}>
            <ListItemIcon className="text-slate-400"><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton className="rounded-lg hover:bg-rose-900/30 text-rose-400" onClick={() => { dispatch(logout()); navigate('/'); }}>
            <ListItemIcon className="text-rose-400"><Logout /></ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </ListItem>
      </List>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <Avatar sx={{ bgcolor: '#14b8a6', height: 32, width: 32 }}>{user.firstName[0]}</Avatar>
          <div className="overflow-hidden">
            <Typography variant="subtitle2" className="text-white truncate">{user.firstName} {user.lastName}</Typography>
            <Typography variant="caption" className="text-slate-500 block truncate">{user.email}</Typography>
          </div>
        </div>
      </div>
    </div>
  );

  return (

    <Box sx={{ display: 'flex' }} className="min-h-screen bg-slate-50">
      <CssBaseline />
      <SkipLink />

      {/* Mobile AppBar */}
      <AppBar
        component="header"
        position="fixed"
        sx={{
          bgcolor: 'white',
          boxShadow: 1,
          color: 'text.primary',
          display: { sm: 'none' },
          ml: { sm: `${drawerWidth}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" className="font-bold">
            Agent Workspace
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        aria-label="Agent Navigation"
        sx={{ flexShrink: { sm: 0 }, width: { sm: drawerWidth } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            display: { sm: 'none', xs: 'block' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': { border: 'none', boxSizing: 'border-box', width: drawerWidth },
            display: { sm: 'block', xs: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        className="h-screen overflow-y-auto outline-none"
      >
        <Toolbar sx={{ display: { sm: 'none' } }} />
        {children}
      </Box>
    </Box >
  );
};

export default AgentShell;
