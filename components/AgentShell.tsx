import React, { useEffect, useState } from 'react';
import { AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Button, Avatar } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Business, People, Description, Logout, Settings, ChevronLeft, Assessment, Chat, Handshake } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, logout } from '../store';
import { useTenant } from '../contexts/TenantConfigContext';

const drawerWidth = 260;

interface AgentShellProps {
  children: React.ReactNode;
}

const AgentShell: React.FC<AgentShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const tenant = useTenant();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
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
      { text: 'Dashboard', icon: <Dashboard />, path: '/agent/dashboard' },
      { text: 'Deals', icon: <Business />, path: '/agent/deals' },
      { text: 'Investors', icon: <People />, path: '/agent/investors' },
      { text: 'Offers', icon: <Description />, path: '/agent/offers' },
      { text: 'Referrals', icon: <Handshake />, path: '/agent/referrals' }, // Added
      { text: 'Messages', icon: <Chat />, path: '/agent/messages' },
      { text: 'Analytics', icon: <Assessment />, path: '/agent/analytics' },
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
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#14b8a6' }}>{user.firstName[0]}</Avatar>
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
      
      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { sm: 'none' },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
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
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        className="h-screen overflow-y-auto"
      >
        <Toolbar sx={{ display: { sm: 'none' } }} />
        {children}
      </Box>
    </Box>
  );
};

export default AgentShell;
