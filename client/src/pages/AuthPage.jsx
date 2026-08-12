import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { AmbientBackground } from '../components/AmbientBackground';
import { GlassButton } from '../components/ui/GlassButton';

export function AuthPage({ mode = 'sign-in' }) {
  const isPublishableKeySet = Boolean(
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('placeholder')
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Animated Glowing Background Orbs */}
      <AmbientBackground />

      <div className="mb-6 flex flex-col items-center gap-2">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/assets/logo.svg" alt="Thodar" className="h-10 w-auto" width={180} height={42} />
        </Link>
        <p className="text-xs text-gray-400">Enterprise Recruitment Email &amp; Document Automation</p>
      </div>

      <div className="w-full max-w-md glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl">
        {isPublishableKeySet ? (
          mode === 'sign-in' ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: 'bg-transparent shadow-none p-0',
                  headerTitle: 'text-white font-bold',
                  headerSubtitle: 'text-gray-400',
                  formButtonPrimary: 'bg-white text-black hover:bg-gray-200 font-medium rounded-full',
                  formFieldInput: 'glass bg-white/5 border border-white/20 text-white rounded-xl',
                  footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                },
              }}
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: 'bg-transparent shadow-none p-0',
                  headerTitle: 'text-white font-bold',
                  headerSubtitle: 'text-gray-400',
                  formButtonPrimary: 'bg-white text-black hover:bg-gray-200 font-medium rounded-full',
                  formFieldInput: 'glass bg-white/5 border border-white/20 text-white rounded-xl',
                  footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                },
              }}
            />
          )
        ) : (
          <div className="space-y-5 text-center py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Clerk Identity Active</h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Enter dashboard workspace to explore candidate campaigns and document automation.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/dashboard">
                <GlassButton variant="gradient" className="w-full">
                  Enter Dashboard
                </GlassButton>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
          <ArrowLeftIcon className="size-3.5" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
