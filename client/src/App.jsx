import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './layouts/AppLayout';
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

        {/* Protected App Shell Routes */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/candidates"
          element={
            <AppLayout>
              <CandidatesPage />
            </AppLayout>
          }
        />
        <Route
          path="/campaigns"
          element={
            <AppLayout>
              <CampaignsPage />
            </AppLayout>
          }
        />
        <Route
          path="/campaigns/create"
          element={
            <AppLayout>
              <CampaignWizardPage />
            </AppLayout>
          }
        />
        <Route
          path="/campaigns/:id"
          element={
            <AppLayout>
              <CampaignDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/email-templates"
          element={
            <AppLayout>
              <EmailTemplatesPage />
            </AppLayout>
          }
        />
        <Route
          path="/document-templates"
          element={
            <AppLayout>
              <DocumentTemplatesPage />
            </AppLayout>
          }
        />
        <Route
          path="/documents"
          element={
            <AppLayout>
              <DocumentsPage />
            </AppLayout>
          }
        />
        <Route
          path="/email-logs"
          element={
            <AppLayout>
              <EmailLogsPage />
            </AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <AppLayout>
              <AuditLogsPage />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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