import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { setClerkTokenGetter } from './services/api';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const CandidatesPage = lazy(() => import('./pages/CandidatesPage').then(module => ({ default: module.CandidatesPage })));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage').then(module => ({ default: module.CampaignsPage })));
const CampaignWizardPage = lazy(() => import('./pages/CampaignWizardPage').then(module => ({ default: module.CampaignWizardPage })));
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage').then(module => ({ default: module.CampaignDetailPage })));
const EmailTemplatesPage = lazy(() => import('./pages/EmailTemplatesPage').then(module => ({ default: module.EmailTemplatesPage })));
const DocumentTemplatesPage = lazy(() => import('./pages/DocumentTemplatesPage').then(module => ({ default: module.DocumentTemplatesPage })));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage').then(module => ({ default: module.DocumentsPage })));
const EmailLogsPage = lazy(() => import('./pages/EmailLogsPage').then(module => ({ default: module.EmailLogsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then(module => ({ default: module.AuditLogsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function TokenBridge() {
  const { getToken } = useClerkAuth();

  useEffect(() => {
    if (getToken) {
      setClerkTokenGetter(getToken);
    }
  }, [getToken]);

  return null;
}

function FallbackRedirect() {
  const { isSignedIn } = useUser();
  return <Navigate to={isSignedIn ? '/dashboard' : '/'} replace />;
}

export default function App() {
  const isKeyValid = Boolean(
    CLERK_PUBLISHABLE_KEY && !CLERK_PUBLISHABLE_KEY.includes('placeholder')
  );

  const AppRoutes = (
    <ToastProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="p-8 text-center text-gray-400 glass rounded-2xl animate-pulse max-w-xs w-full">
            Loading page modules...
          </div>
        </div>
      }>
        <Routes>
          {/* Public Marketing Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
          <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />

          {/* Protected App Shell Routes - Guarded with ProtectedRoute */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <CandidatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <CampaignsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/create"
            element={
              <ProtectedRoute>
                <CampaignWizardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <ProtectedRoute>
                <CampaignDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-templates"
            element={
              <ProtectedRoute>
                <EmailTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-templates"
            element={
              <ProtectedRoute>
                <DocumentTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-logs"
            element={
              <ProtectedRoute>
                <EmailLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );

  if (isKeyValid) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
        <TokenBridge />
        {AppRoutes}
      </ClerkProvider>
    );
  }

  return AppRoutes;
}