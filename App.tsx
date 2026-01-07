import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';
import { store } from './store';
import theme from './theme';
import { TenantConfigProvider } from './contexts/TenantConfigContext';
import { ToastProvider } from './contexts/ToastContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import AppErrorBoundary from './components/AppErrorBoundary';

// Layouts
import AppShell from './components/AppShell';
import AgentShell from './components/AgentShell';
import OrgSettingsShell from './components/org/OrgSettingsShell';

// Eagerly loaded critical pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/auth/SignInPage';

// Lazy loaded pages
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const OnboardingWizard = lazy(() => import('./pages/onboarding/OnboardingWizard'));
const AccessRequestPage = lazy(() => import('./pages/onboarding/AccessRequestPage'));

// Account Pages
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const SavedDealsPage = lazy(() => import('./pages/account/SavedDealsPage'));
const PreferencesPage = lazy(() => import('./pages/account/PreferencesPage'));
const SettingsPage = lazy(() => import('./pages/account/SettingsPage'));
const InvestorAnalyticsPage = lazy(() => import('./pages/analytics/InvestorAnalyticsPage'));
const LoyaltyPage = lazy(() => import('./pages/account/LoyaltyPage'));
const ActivityLogPage = lazy(() => import('./pages/account/ActivityLogPage'));

// Agent Pages
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const AgentDealsPage = lazy(() => import('./pages/agent/AgentDealsPage'));
const DealEditorPage = lazy(() => import('./pages/agent/DealEditorPage'));
const AgentInvestorsPage = lazy(() => import('./pages/agent/AgentInvestorsPage'));
const AgentOffersPage = lazy(() => import('./pages/agent/AgentOffersPage'));
const AgentDealPage = lazy(() => import('./pages/agent/AgentDealPage'));
const AgentAnalyticsPage = lazy(() => import('./pages/agent/AgentAnalyticsPage'));
const AgentReferralsPage = lazy(() => import('./pages/agent/AgentReferralsPage'));

// Org Pages
const GeneralSettingsPage = lazy(() => import('./pages/org/GeneralSettingsPage'));
const BrandingPage = lazy(() => import('./pages/org/BrandingPage'));
const UsersPage = lazy(() => import('./pages/org/UsersPage'));
const RolesPage = lazy(() => import('./pages/org/RolesPage'));
const MarketsPage = lazy(() => import('./pages/org/MarketsPage'));
const IntegrationsPage = lazy(() => import('./pages/org/IntegrationsPage'));

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <CircularProgress size={40} />
    </div>
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <FeatureFlagProvider>
            <TenantConfigProvider>
            <ToastProvider>
                <CssBaseline />
                <AppErrorBoundary>
                    <Router>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Auth Routes */}
                            <Route path="/signin" element={<SignInPage />} />
                            <Route path="/signup" element={<SignUpPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/onboarding" element={<OnboardingWizard />} />

                            {/* Agent Routes */}
                            <Route path="/agent/*" element={
                                <AgentShell>
                                    <Routes>
                                        <Route path="dashboard" element={<AgentDashboard />} />
                                        <Route path="deals" element={<AgentDealsPage />} />
                                        <Route path="deals/new" element={<DealEditorPage />} />
                                        <Route path="deals/:id/edit" element={<DealEditorPage />} />
                                        <Route path="deals/:id" element={<AgentDealPage />} />
                                        <Route path="investors" element={<AgentInvestorsPage />} />
                                        <Route path="offers" element={<AgentOffersPage />} />
                                        <Route path="analytics" element={<AgentAnalyticsPage />} />
                                        <Route path="referrals" element={<AgentReferralsPage />} />
                                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                                    </Routes>
                                </AgentShell>
                            } />

                            {/* Organization Settings Routes */}
                            <Route path="/org/settings/*" element={
                                <OrgSettingsShell>
                                    <Routes>
                                        <Route path="" element={<GeneralSettingsPage />} />
                                        <Route path="branding" element={<BrandingPage />} />
                                        <Route path="users" element={<UsersPage />} />
                                        <Route path="roles" element={<RolesPage />} />
                                        <Route path="markets" element={<MarketsPage />} />
                                        <Route path="integrations" element={<IntegrationsPage />} />
                                        <Route path="*" element={<Navigate to="" replace />} />
                                    </Routes>
                                </OrgSettingsShell>
                            } />

                            {/* Main App Routes */}
                            <Route path="/*" element={
                            <AppShell>
                                <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/browse" element={<BrowsePage />} />
                                <Route path="/property/:id" element={<PropertyDetailPage />} />
                                <Route path="/notifications" element={<NotificationsPage />} />
                                
                                {/* Protected / Account Routes */}
                                <Route path="/access-request" element={<AccessRequestPage />} />
                                <Route path="/saved" element={<SavedDealsPage />} />
                                <Route path="/analytics" element={<InvestorAnalyticsPage />} />
                                <Route path="/rewards" element={<LoyaltyPage />} />
                                <Route path="/account/profile" element={<ProfilePage />} />
                                <Route path="/account/preferences" element={<PreferencesPage />} />
                                <Route path="/account/settings" element={<SettingsPage />} />
                                <Route path="/account/activity" element={<ActivityLogPage />} />
                                
                                <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </AppShell>
                            } />
                        </Routes>
                    </Suspense>
                    </Router>
                </AppErrorBoundary>
            </ToastProvider>
            </TenantConfigProvider>
        </FeatureFlagProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
