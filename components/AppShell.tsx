
import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Button, IconButton, Container, Box, Typography, Badge, Menu, MenuItem, ListItemIcon, Divider, Avatar, Alert } from '@mui/material';
import { Menu as MenuIcon, FavoriteBorder, PersonOutline, Logout, Settings, Dashboard, Favorite, Notifications, Mail, WifiOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, logout, setInboxDrawerOpen } from '../store';
import { useTenant } from '../contexts/TenantConfigContext';
import NotificationMenu from './NotificationMenu';
import InboxDrawer from './InboxDrawer';
import GlobalSearch from './GlobalSearch';
import { useAccessibilityAudit } from '../hooks/useAccessibility';
import SkipLink from './SkipLink';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Visual badge indicating the environment (Development only).
 */
const EnvBadge = () => (
    <div 
        className="fixed bottom-4 left-4 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-50 hover:opacity-100 z-50 pointer-events-none"
        aria-hidden="true"
    >
        DEV
    </div>
);

/**
 * Main application shell component that provides the persistent layout structure.
 * Includes the Navigation Bar, Sidebar (mobile), Footer, and Global Drawers (Inbox, Notifications).
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const tenant = useTenant();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { savedIds } = useSelector((state: RootState) => state.saved);
  const { unreadCount: notifUnread } = useSelector((state: RootState) => state.notifications);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifEl, setNotifEl] = useState<null | HTMLElement>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Ref for managing focus restoration if needed, though route change focus management is handled below
  const mainRef = useRef<HTMLElement>(null);

  useAccessibilityAudit();

  // Focus Management: Move focus to main content on route change
  useEffect(() => {
      // Small timeout to allow DOM to update
      const timer = setTimeout(() => {
          if (mainRef.current) {
              mainRef.current.focus();
          } else {
              // Fallback to finding h1
              const h1 = document.querySelector('h1');
              if (h1) (h1 as HTMLElement).focus();
          }
      }, 100);
      return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => setNotifEl(event.currentTarget);
  const handleNotifClose = () => setNotifEl(null);

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SkipLink />
      <InboxDrawer />
      <EnvBadge />
      
      {isOffline && (
          <Alert 
            severity="warning" 
            icon={<WifiOff />} 
            action={<Button color="inherit" size="small">Retry</Button>} 
            className="rounded-none border-b border-orange-200"
            role="status"
          >
              You are currently offline. Some features may be unavailable.
          </Alert>
      )}
      
      <AppBar 
        component="header" 
        position="sticky" 
        color="inherit" 
        elevation={0} 
        className="border-b border-slate-200 bg-white/95 backdrop-blur-md"
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters className="h-20 justify-between gap-4">
            {/* Logo Area */}
            <nav aria-label="Primary" className="flex items-center gap-8 shrink-0">
              <a 
                href="/"
                className="flex items-center gap-3 cursor-pointer group no-underline text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900 rounded-lg p-1"
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                aria-label={`${tenant.name} Home`}
              >
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105" aria-hidden="true">
                  <span className="text-white font-serif font-bold text-xl">V</span>
                </div>
                <div className="hidden md:block">
                    <Typography variant="h6" component="span" className="font-bold tracking-tight leading-none">
                    {tenant.name}
                    </Typography>
                </div>
              </a>
              
              <div className="hidden lg:flex gap-6">
                <Button color="inherit" onClick={() => navigate('/browse')} className="font-medium text-slate-600">Buy</Button>
                <Button color="inherit" className="font-medium text-slate-600">Sell</Button>
                <Button color="inherit" className="font-medium text-slate-600">Services</Button>
              </div>
            </nav>

            {/* Search Area */}
            <div role="search" className="flex-grow max-w-lg hidden md:block">
                <GlobalSearch />
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              {isAuthenticated ? (
                <>
                  <IconButton 
                    onClick={() => navigate('/saved')} 
                    className="text-slate-600 hover:text-rose-500 transition-colors"
                    aria-label={`Saved Deals, ${savedIds.length} items`}
                  >
                    <Badge badgeContent={savedIds.length} color="secondary">
                      <FavoriteBorder />
                    </Badge>
                  </IconButton>

                  <IconButton 
                    onClick={() => dispatch(setInboxDrawerOpen(true))} 
                    className="text-slate-600 hover:text-slate-900"
                    aria-label="Messages, 1 unread"
                  >
                    <Badge badgeContent={1} color="error">
                      <Mail />
                    </Badge>
                  </IconButton>

                  <IconButton 
                    onClick={handleNotifOpen} 
                    className="text-slate-600 hover:text-slate-900"
                    aria-label={`Notifications, ${notifUnread} unread`}
                    aria-controls="notification-menu"
                    aria-haspopup="true"
                    aria-expanded={Boolean(notifEl)}
                  >
                    <Badge badgeContent={notifUnread} color="error" variant="dot">
                      <Notifications />
                    </Badge>
                  </IconButton>

                  <IconButton 
                    onClick={handleMenuOpen} 
                    className="p-0 ml-2"
                    aria-label="Account settings"
                    aria-controls="account-menu"
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl)}
                  >
                    <Avatar sx={{ bgcolor: tenant.primaryColor, width: 40, height: 40, fontSize: '1rem' }} alt={`${user?.firstName} ${user?.lastName}`}>
                        {user?.firstName[0]}{user?.lastName[0]}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    onClick={() => navigate('/signin')}
                    className="hidden sm:flex border-slate-300 hover:border-slate-800 text-slate-700 font-semibold"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/signup')}
                    className="hidden sm:flex font-semibold shadow-none"
                  >
                    Join
                  </Button>
                </>
              )}
              
              <IconButton 
                className="lg:hidden" 
                onClick={() => {/* Toggle Mobile Menu */}}
                aria-label="Open main menu"
              >
                <MenuIcon />
              </IconButton>
            </div>
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Menu */}
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
            elevation: 0,
            sx: {
                minWidth: 200,
                borderRadius: 3,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                border: '1px solid #e2e8f0'
            }
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/account/profile'); }}>
          <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon> Profile
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/account/activity'); }}>
          <ListItemIcon><History fontSize="small" /></ListItemIcon> Activity Log
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/saved'); }}>
          <ListItemIcon><Favorite fontSize="small" /></ListItemIcon> Saved Deals
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/account/preferences'); }}>
          <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon> Preferences
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); navigate('/account/settings'); }}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon> Sign Out
        </MenuItem>
      </Menu>

       {/* Notifications Menu */}
       <NotificationMenu 
            anchorEl={notifEl} 
            open={Boolean(notifEl)} 
            onClose={handleNotifClose} 
       />

      <main 
        id="main-content" 
        className="flex-grow flex flex-col relative outline-none" 
        tabIndex={-1}
        ref={mainRef}
      >
        {children}
      </main>

      <Box component="footer" className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
        <Container maxWidth="lg">
          <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <Typography variant="subtitle2" component="h2" className="font-bold mb-4 text-slate-900">Company</Typography>
              <ul className="space-y-2 text-sm text-slate-700 list-none p-0">
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">About Us</a></li>
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">Press</a></li>
              </ul>
            </div>
            <div>
              <Typography variant="subtitle2" component="h2" className="font-bold mb-4 text-slate-900">Resources</Typography>
              <ul className="space-y-2 text-sm text-slate-700 list-none p-0">
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">Market Reports</a></li>
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">ROI Calculator</a></li>
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">Lender Network</a></li>
              </ul>
            </div>
             <div>
              <Typography variant="subtitle2" component="h2" className="font-bold mb-4 text-slate-900">Support</Typography>
              <ul className="space-y-2 text-sm text-slate-700 list-none p-0">
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">Contact</a></li>
                <li><a href="#" className="hover:text-slate-900 no-underline focus:outline-2 focus:outline-slate-900 rounded p-0.5">Terms of Service</a></li>
              </ul>
            </div>
          </nav>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200">
            <Typography variant="caption" className="text-slate-600">
              © 2024 {tenant.name} Real Estate. All rights reserved.
            </Typography>
          </div>
        </Container>
      </Box>
    </div>
  );
};

export default AppShell;
