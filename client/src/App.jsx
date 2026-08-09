import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignWizardPage } from './pages/CampaignWizardPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { EmailTemplatesPage } from './pages/EmailTemplatesPage';
import { DocumentTemplatesPage } from './pages/DocumentTemplatesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { EmailLogsPage } from './pages/EmailLogsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { setClerkTokenGetter } from './services/api';

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