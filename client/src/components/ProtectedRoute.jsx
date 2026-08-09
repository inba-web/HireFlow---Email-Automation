import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { AppLayout } from '../layouts/AppLayout';

export function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  const isKeyValid = Boolean(
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('placeholder')
  );

  // If Clerk publishable key is not set (mock dev mode), allow direct access
  if (!isKeyValid) {
    return <AppLayout>{children}</AppLayout>;
  }

  // While Clerk initializes auth session
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-[#D10A8A] border-t-transparent animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to sign-in page
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Authenticated: Render protected app layout with requested child page
  return <AppLayout>{children}</AppLayout>;
}
